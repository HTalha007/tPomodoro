import { Injectable, Inject } from '@nestjs/common';
import {
  StorePort,
  ClockPort,
  PeriodCalculator,
  StreakCalculator,
} from '@tpomodoro/domain';
import { STORE_PORT } from '../../infrastructure/database/drizzle-store.adapter';
import { CLOCK_PORT } from '../../infrastructure/clock/system-clock.adapter';
import { SummaryResponseDto, UserStatsDto } from '@tpomodoro/contracts';

@Injectable()
export class SummaryService {
  constructor(
    @Inject(STORE_PORT) private readonly store: StorePort,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async getSummary(accountId: string): Promise<SummaryResponseDto> {
    const now = this.clock.now();
    const credits = await this.store.getAllAccountCredits(accountId);

    // AC-O01 - AC-O03: Period calculation
    const periodSummary = PeriodCalculator.calculateSummary(credits, now);

    // AC-S01 - AC-S04: Streak calculation
    const streakDays = StreakCalculator.calculateStreak(credits, now);

    return {
      todayCreditedSeconds: periodSummary.todayCreditedSeconds,
      thisWeekCreditedSeconds: periodSummary.thisWeekCreditedSeconds,
      streakDays,
      serverNow: now.toISOString(),
    };
  }

  async getUserStats(accountId: string): Promise<UserStatsDto> {
    const now = this.clock.now();
    const credits = await this.store.getAllAccountCredits(accountId);

    const periodSummary = PeriodCalculator.calculateSummary(credits, now);
    const streakDays = StreakCalculator.calculateStreak(credits, now);

    const todayCompletedCredits = credits.filter(
      (c) => PeriodCalculator.isToday(c.closedAt, now) && c.creditedSeconds > 0
    );

    return {
      todayMinutes: Math.floor(periodSummary.todayCreditedSeconds / 60),
      todayCreditedSeconds: periodSummary.todayCreditedSeconds,
      completedRoundsCount: todayCompletedCredits.length,
      weekMinutes: Math.floor(periodSummary.thisWeekCreditedSeconds / 60),
      weekGoalMinutes: 600, // Standard weekly focus goal
      thisWeekCreditedSeconds: periodSummary.thisWeekCreditedSeconds,
      streakDays,
      serverNow: now.toISOString(),
    };
  }
}
