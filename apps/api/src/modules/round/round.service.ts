import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  StorePort,
  ClockPort,
  RoundModel,
  RoundStateMachine,
  RoundDomainError,
  CreditEntryModel,
} from '@tpomodoro/domain';
import { STORE_PORT } from '../../infrastructure/database/drizzle-store.adapter';
import { CLOCK_PORT } from '../../infrastructure/clock/system-clock.adapter';
import { RoundResponseDto, StartRoundDto } from '@tpomodoro/contracts';
import * as crypto from 'crypto';

@Injectable()
export class RoundService {
  constructor(
    @Inject(STORE_PORT) private readonly store: StorePort,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async startRound(accountId: string, dto: StartRoundDto): Promise<RoundResponseDto> {
    const plannedMinutes = Number(dto.plannedMinutes);
    const now = this.clock.now();

    // 1. Check if there is an existing active round for this account
    const existingActiveRound = await this.store.findActiveRound(accountId);
    if (existingActiveRound) {
      // AC-K16: Automatically close the previous round before starting a new one
      const { closedRound, credit } = RoundStateMachine.closeForNewRound(
        existingActiveRound,
        now
      );

      // Check for active room membership to attach roomId (AC-R06)
      const activeMembership = await this.store.findActiveMembership(accountId);
      const creditEntry: CreditEntryModel = {
        entryId: crypto.randomUUID(),
        roundId: closedRound.roundId,
        accountId,
        creditedSeconds: credit.creditedSeconds,
        outcome: credit.outcome,
        closedAt: credit.closedAt,
        roomId: activeMembership?.roomId ?? null,
        createdAt: now,
      };

      await this.store.closeRoundAndRecordCredit(closedRound, creditEntry);
    }

    // 2. Create new round
    try {
      const newRound = RoundStateMachine.createRound({
        roundId: crypto.randomUUID(),
        accountId,
        plannedMinutes,
        now,
      });

      const savedRound = await this.store.createRound(newRound);
      return this.mapToDto(savedRound, now);
    } catch (err) {
      if (err instanceof RoundDomainError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async getActiveRound(accountId: string): Promise<RoundResponseDto | null> {
    const now = this.clock.now();
    const activeRound = await this.store.findActiveRound(accountId);
    if (!activeRound) return null;

    // AC-K14, AC-K15: Evaluate round progression upon query
    const evaluation = RoundStateMachine.evaluateAt(activeRound, now);

    if (evaluation.changed) {
      if (evaluation.creditGenerated) {
        // Plan has completed, close round and save credit
        const activeMembership = await this.store.findActiveMembership(accountId);
        const creditEntry: CreditEntryModel = {
          entryId: crypto.randomUUID(),
          roundId: evaluation.updatedRound.roundId,
          accountId,
          creditedSeconds: evaluation.creditGenerated.creditedSeconds,
          outcome: evaluation.creditGenerated.outcome,
          closedAt: evaluation.creditGenerated.closedAt,
          roomId: activeMembership?.roomId ?? null,
          createdAt: now,
        };

        const { round } = await this.store.closeRoundAndRecordCredit(
          evaluation.updatedRound,
          creditEntry
        );
        return this.mapToDto(round, now);
      } else {
        // Phase shifted to awaiting_decision
        const updated = await this.store.updateRound(evaluation.updatedRound);
        return this.mapToDto(updated, now);
      }
    }

    return this.mapToDto(activeRound, now);
  }

  async resumeRound(accountId: string): Promise<RoundResponseDto> {
    const now = this.clock.now();
    const activeRound = await this.getActiveRound(accountId);
    if (!activeRound) {
      throw new NotFoundException('No active round found to resume.');
    }

    const roundModel = await this.store.findRoundById(activeRound.roundId);
    if (!roundModel || roundModel.accountId !== accountId) {
      throw new NotFoundException('Active round not found.');
    }

    try {
      // AC-K04, AC-K05: Resume round or reject early resume
      const updatedRound = RoundStateMachine.resume(roundModel, now);
      const saved = await this.store.updateRound(updatedRound);
      return this.mapToDto(saved, now);
    } catch (err) {
      if (err instanceof RoundDomainError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async abandonRound(accountId: string): Promise<RoundResponseDto> {
    const now = this.clock.now();
    const activeRound = await this.store.findActiveRound(accountId);
    if (!activeRound) {
      throw new NotFoundException('No active round found to abandon.');
    }

    const { updatedRound, credit } = RoundStateMachine.abandon(activeRound, now);

    const activeMembership = await this.store.findActiveMembership(accountId);
    const creditEntry: CreditEntryModel = {
      entryId: crypto.randomUUID(),
      roundId: updatedRound.roundId,
      accountId,
      creditedSeconds: credit.creditedSeconds,
      outcome: credit.outcome,
      closedAt: credit.closedAt,
      roomId: activeMembership?.roomId ?? null,
      createdAt: now,
    };

    const { round } = await this.store.closeRoundAndRecordCredit(
      updatedRound,
      creditEntry
    );
    return this.mapToDto(round, now);
  }

  public mapToDto(round: RoundModel, now: Date): RoundResponseDto {
    return {
      roundId: round.roundId,
      plannedSeconds: round.plannedSeconds,
      breakAfterSeconds: round.breakAfterSeconds,
      breakLengthSeconds: round.breakLengthSeconds,
      phase: round.phase,
      startedAt: round.startedAt.toISOString(),
      breakStartedAt: round.breakStartedAt?.toISOString() ?? null,
      resumedAt: round.resumedAt?.toISOString() ?? null,
      closedAt: round.closedAt?.toISOString() ?? null,
      outcome: round.outcome ?? null,
      serverNow: now.toISOString(),
    };
  }
}
