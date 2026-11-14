import { RoundOutcome } from '../models/round.model.js';

export interface CreditCalculationResult {
  outcome: RoundOutcome;
  creditedSeconds: number;
  closedAt: Date;
}

export class CreditCalculator {
  /**
   * Calculates credit for an abandoned round (before break or during break).
   * AC-K06: outcome = 'abandoned', credited_seconds = 0.
   */
  public static calculateAbandoned(closedAt: Date): CreditCalculationResult {
    return {
      outcome: 'abandoned',
      creditedSeconds: 0,
      closedAt,
    };
  }

  /**
   * Calculates credit for a fully completed round.
   * AC-K08: outcome = 'full', credited_seconds = plannedSeconds.
   * closedAt is the mathematical completion timestamp (resumedAt + remainingFocusSeconds).
   */
  public static calculateFull(
    plannedSeconds: number,
    resumedAt: Date,
    breakAfterSeconds: number
  ): CreditCalculationResult {
    const remainingFocusSeconds = plannedSeconds - breakAfterSeconds;
    const mathematicalClosedAt = new Date(
      resumedAt.getTime() + remainingFocusSeconds * 1000
    );

    return {
      outcome: 'full',
      creditedSeconds: plannedSeconds,
      closedAt: mathematicalClosedAt,
    };
  }

  /**
   * Calculates half credit for a round abandoned/closed after resuming but before plan completion.
   * AC-K07: accumulated = break_after_seconds + (now - resumed_at).
   * credited = floor(accumulated / 2).
   */
  public static calculateHalf(
    plannedSeconds: number,
    breakAfterSeconds: number,
    resumedAt: Date,
    now: Date
  ): CreditCalculationResult {
    const secondsSinceResume = Math.max(
      0,
      Math.floor((now.getTime() - resumedAt.getTime()) / 1000)
    );
    const accumulatedFocusSeconds = Math.min(
      plannedSeconds,
      breakAfterSeconds + secondsSinceResume
    );
    const creditedSeconds = Math.floor(accumulatedFocusSeconds / 2);

    return {
      outcome: 'half',
      creditedSeconds,
      closedAt: now,
    };
  }
}
