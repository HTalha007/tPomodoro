import { RoundModel } from '../models/round.model.js';
import { CreditEntryModel } from '../models/credit-entry.model.js';
import { BreakRule } from '../rules/break.rule.js';
import { CreditCalculator, CreditCalculationResult } from '../rules/credit.calculator.js';

export class RoundDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'RoundDomainError';
  }
}

export interface TransitionResult {
  updatedRound: RoundModel;
  creditGenerated?: CreditCalculationResult;
  changed: boolean;
}

export class RoundStateMachine {
  /**
   * Initializes a new round in 'focus_before_break' phase.
   * AC-K13: Validates 15 <= plannedMinutes <= 180.
   */
  public static createRound(params: {
    roundId: string;
    accountId: string;
    plannedMinutes: number;
    now: Date;
  }): RoundModel {
    if (!BreakRule.validatePlannedMinutes(params.plannedMinutes)) {
      throw new RoundDomainError(
        `Planned duration must be an integer between ${BreakRule.MIN_MINUTES} and ${BreakRule.MAX_MINUTES} minutes.`,
        'INVALID_PLANNED_DURATION'
      );
    }

    const plannedSeconds = params.plannedMinutes * 60;
    const breakAfterSeconds = BreakRule.calculateBreakAfterSeconds(plannedSeconds);
    const breakLengthSeconds = BreakRule.calculateBreakLengthSeconds(breakAfterSeconds);

    return {
      roundId: params.roundId,
      accountId: params.accountId,
      plannedSeconds,
      breakAfterSeconds,
      breakLengthSeconds,
      phase: 'focus_before_break',
      startedAt: params.now,
      breakStartedAt: null,
      resumedAt: null,
      closedAt: null,
      outcome: null,
    };
  }

  /**
   * Evaluates the active round at the given current time 'now'.
   * Advances phase to 'awaiting_decision' or closes with 'full' credit if plan elapsed.
   * AC-K14, AC-K15.
   */
  public static evaluateAt(round: RoundModel, now: Date): TransitionResult {
    if (round.phase === 'closed') {
      return { updatedRound: round, changed: false };
    }

    // 1. If in 'focus_before_break' and break point reached
    if (round.phase === 'focus_before_break') {
      const breakThresholdTime = new Date(
        round.startedAt.getTime() + round.breakAfterSeconds * 1000
      );

      if (now >= breakThresholdTime) {
        // AC-K14: break_started_at is the mathematical break point, not arrival time of request
        const updatedRound: RoundModel = {
          ...round,
          phase: 'awaiting_decision',
          breakStartedAt: breakThresholdTime,
        };
        return { updatedRound, changed: true };
      }

      return { updatedRound: round, changed: false };
    }

    // 2. If in 'awaiting_decision', waiting for user command (Resume / Abandon)
    if (round.phase === 'awaiting_decision') {
      return { updatedRound: round, changed: false };
    }

    // 3. If in 'focus_after_break', check if remaining focus time elapsed
    if (round.phase === 'focus_after_break') {
      if (!round.resumedAt) {
        throw new RoundDomainError('Invalid state: resumedAt is missing in focus_after_break phase.', 'CORRUPT_ROUND_STATE');
      }

      const remainingFocusSeconds = round.plannedSeconds - round.breakAfterSeconds;
      const plannedCompletionTime = new Date(
        round.resumedAt.getTime() + remainingFocusSeconds * 1000
      );

      // AC-K15: Plan dolduktan sonraki ilk sorgu turu 'full' kapatır. Plan dolmadan yapılan yenileme 'full' yazmaz.
      if (now >= plannedCompletionTime) {
        const credit = CreditCalculator.calculateFull(
          round.plannedSeconds,
          round.resumedAt,
          round.breakAfterSeconds
        );

        const updatedRound: RoundModel = {
          ...round,
          phase: 'closed',
          closedAt: credit.closedAt,
          outcome: credit.outcome,
        };

        return {
          updatedRound,
          creditGenerated: credit,
          changed: true,
        };
      }

      return { updatedRound: round, changed: false };
    }

    return { updatedRound: round, changed: false };
  }

  /**
   * User issues Resume command during 'awaiting_decision'.
   * AC-K04: Early resume before breakLengthSeconds elapses is rejected.
   * AC-K05: Once breakLengthSeconds elapses, resume is accepted and phase becomes 'focus_after_break'.
   */
  public static resume(round: RoundModel, now: Date): RoundModel {
    if (round.phase !== 'awaiting_decision') {
      throw new RoundDomainError(
        `Cannot resume round in phase: ${round.phase}. Expected: awaiting_decision.`,
        'INVALID_PHASE_FOR_RESUME'
      );
    }

    if (!round.breakStartedAt) {
      throw new RoundDomainError('Invalid state: breakStartedAt is missing.', 'CORRUPT_ROUND_STATE');
    }

    const breakAllowedResumeTime = new Date(
      round.breakStartedAt.getTime() + round.breakLengthSeconds * 1000
    );

    // AC-K04: Mola bitmeden Devam reddedilir. Faz awaiting_decision kalır.
    if (now < breakAllowedResumeTime) {
      throw new RoundDomainError(
        'Break period is not finished yet. Early resume is not allowed.',
        'EARLY_RESUME_REJECTED'
      );
    }

    // AC-K05: Mola süresi dolunca Devam kabul edilir. Faz focus_after_break olur.
    return {
      ...round,
      phase: 'focus_after_break',
      resumedAt: now,
    };
  }

  /**
   * User issues Abandon command.
   * AC-K06: Before break or during break -> outcome = 'abandoned', credit = 0.
   * AC-K07: After resume before plan completes -> outcome = 'half'.
   * AC-K08: If already elapsed -> outcome = 'full'.
   * AC-K09: Idempotent if already closed.
   */
  public static abandon(round: RoundModel, now: Date): { updatedRound: RoundModel; credit: CreditCalculationResult } {
    if (round.phase === 'closed') {
      // AC-K09: Idempotent return of existing closure
      return {
        updatedRound: round,
        credit: {
          outcome: round.outcome ?? 'abandoned',
          creditedSeconds: round.outcome === 'full' ? round.plannedSeconds : 0,
          closedAt: round.closedAt ?? now,
        },
      };
    }

    // 1. Abandon before break or during break decision
    if (round.phase === 'focus_before_break' || round.phase === 'awaiting_decision') {
      const credit = CreditCalculator.calculateAbandoned(now);
      const updatedRound: RoundModel = {
        ...round,
        phase: 'closed',
        closedAt: credit.closedAt,
        outcome: credit.outcome,
      };
      return { updatedRound, credit };
    }

    // 2. Abandon in focus_after_break
    if (round.phase === 'focus_after_break') {
      const remainingFocusSeconds = round.plannedSeconds - round.breakAfterSeconds;
      const plannedCompletionTime = new Date(
        round.resumedAt!.getTime() + remainingFocusSeconds * 1000
      );

      if (now >= plannedCompletionTime) {
        // Plan has completed
        const credit = CreditCalculator.calculateFull(
          round.plannedSeconds,
          round.resumedAt!,
          round.breakAfterSeconds
        );
        const updatedRound: RoundModel = {
          ...round,
          phase: 'closed',
          closedAt: credit.closedAt,
          outcome: credit.outcome,
        };
        return { updatedRound, credit };
      }

      // AC-K07: Half credit
      const credit = CreditCalculator.calculateHalf(
        round.plannedSeconds,
        round.breakAfterSeconds,
        round.resumedAt!,
        now
      );
      const updatedRound: RoundModel = {
        ...round,
        phase: 'closed',
        closedAt: credit.closedAt,
        outcome: credit.outcome,
      };
      return { updatedRound, credit };
    }

    throw new RoundDomainError(`Unexpected phase: ${round.phase}`, 'UNEXPECTED_PHASE');
  }

  /**
   * Automatically closes an existing open round when a new round is started.
   * AC-K16:
   * - Karar bekleyen veya mola öncesi tur -> 0 (abandoned)
   * - Devam edilmiş ve bitmemiş tur -> yarım (half)
   * - Planı dolmuş tur -> tam (full)
   */
  public static closeForNewRound(existingRound: RoundModel, now: Date): { closedRound: RoundModel; credit: CreditCalculationResult } {
    const { updatedRound, credit } = this.abandon(existingRound, now);
    return { closedRound: updatedRound, credit };
  }
}
