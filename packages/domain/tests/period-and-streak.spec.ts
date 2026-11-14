import { describe, it, expect } from 'vitest';
import { PeriodCalculator } from '../src/rules/period.calculator.js';
import { StreakCalculator } from '../src/rules/streak.calculator.js';
import { CreditEntryModel } from '../src/models/credit-entry.model.js';

describe('Period & Streak Rules (AC-O01 - AC-O03, AC-S01 - AC-S04)', () => {
  it('AC-O03: Istanbul Sunday 23:59 belongs to previous week, Monday 00:00 belongs to next week', () => {
    // 2026-11-15 is Sunday. In Istanbul (UTC+3), 23:59 is 20:59 UTC.
    const sunday2359 = new Date('2026-11-15T20:59:00.000Z');
    // 2026-11-16 is Monday. In Istanbul (UTC+3), 00:00 is 21:00 UTC on Sunday Nov 15.
    const monday0000 = new Date('2026-11-15T21:00:00.000Z');

    const sundayWeekStart = PeriodCalculator.getStartOfWeek(sunday2359);
    const mondayWeekStart = PeriodCalculator.getStartOfWeek(monday0000);

    // Sunday week starts on Monday Nov 9 (Nov 8 21:00 UTC)
    expect(sundayWeekStart.toISOString()).toBe('2026-11-08T21:00:00.000Z');
    // Monday week starts on Monday Nov 16 (Nov 15 21:00 UTC)
    expect(mondayWeekStart.toISOString()).toBe('2026-11-15T21:00:00.000Z');

    expect(sundayWeekStart.getTime()).not.toEqual(mondayWeekStart.getTime());
  });

  it('AC-O01 & AC-O02: calculates today and this week sums correctly, ignoring 0-credit entries', () => {
    // Reference now: 2026-11-14 15:00 UTC (18:00 Istanbul, Saturday)
    const now = new Date('2026-11-14T15:00:00.000Z');

    const credits: CreditEntryModel[] = [
      // Today: 1800s full
      {
        entryId: '1',
        roundId: 'r1',
        accountId: 'a1',
        creditedSeconds: 1800,
        outcome: 'full',
        closedAt: new Date('2026-11-14T10:00:00.000Z'), // Today
        createdAt: new Date(),
      },
      // Today: abandoned (0s) -> should not increment
      {
        entryId: '2',
        roundId: 'r2',
        accountId: 'a1',
        creditedSeconds: 0,
        outcome: 'abandoned',
        closedAt: new Date('2026-11-14T12:00:00.000Z'), // Today
        createdAt: new Date(),
      },
      // Earlier this week (Thursday Nov 12): 1200s
      {
        entryId: '3',
        roundId: 'r3',
        accountId: 'a1',
        creditedSeconds: 1200,
        outcome: 'half',
        closedAt: new Date('2026-11-12T10:00:00.000Z'), // This week
        createdAt: new Date(),
      },
      // Previous week (Sunday Nov 8 20:00 UTC = 23:00 Istanbul Nov 8): 1800s
      {
        entryId: '4',
        roundId: 'r4',
        accountId: 'a1',
        creditedSeconds: 1800,
        outcome: 'full',
        closedAt: new Date('2026-11-08T20:00:00.000Z'), // Previous week
        createdAt: new Date(),
      },
    ];

    const summary = PeriodCalculator.calculateSummary(credits, now);
    expect(summary.todayCreditedSeconds).toBe(1800);
    expect(summary.thisWeekCreditedSeconds).toBe(1800 + 1200); // 3000s
  });

  describe('Streak Calculation (AC-S01 - AC-S04)', () => {
    const createCredit = (daysAgo: number, seconds: number): CreditEntryModel => {
      // Base date: 2026-11-14 12:00 UTC
      const base = new Date('2026-11-14T12:00:00.000Z');
      const targetDate = new Date(base.getTime() - daysAgo * 24 * 3600 * 1000);
      return {
        entryId: `e-${daysAgo}`,
        roundId: `r-${daysAgo}`,
        accountId: 'acc1',
        creditedSeconds: seconds,
        outcome: seconds > 0 ? 'full' : 'abandoned',
        closedAt: targetDate,
        createdAt: targetDate,
      };
    };

    const now = new Date('2026-11-14T12:00:00.000Z');

    it('AC-S02: if today has credit, counts today and previous consecutive days', () => {
      // Credits today (0 days ago), yesterday (1 day ago), and 2 days ago
      const credits = [
        createCredit(0, 1800),
        createCredit(1, 1800),
        createCredit(2, 1800),
        // Day 3 missing
        createCredit(4, 1800),
      ];

      expect(StreakCalculator.calculateStreak(credits, now)).toBe(3);
    });

    it('AC-S03: if today has no credit, streak counts from yesterday backwards (not broken until day ends)', () => {
      // No credit today (0 days ago). Credit yesterday (1 day ago) and 2 days ago.
      const credits = [
        createCredit(1, 1800),
        createCredit(2, 1800),
        createCredit(3, 1800),
      ];

      expect(StreakCalculator.calculateStreak(credits, now)).toBe(3);
    });

    it('AC-S03: if both today and yesterday have no credit, streak is 0', () => {
      // Credit 2 days ago, but yesterday (1 day ago) and today (0) are empty
      const credits = [
        createCredit(2, 1800),
        createCredit(3, 1800),
      ];

      expect(StreakCalculator.calculateStreak(credits, now)).toBe(0);
    });

    it('AC-S01: days with only 0 credit (abandoned) do not count towards streak', () => {
      const credits = [
        createCredit(0, 0), // Today has an abandoned round (0 credit)
        createCredit(1, 1800), // Yesterday has credit
      ];

      // Since today has 0 credit, it evaluates yesterday backwards -> streak 1
      expect(StreakCalculator.calculateStreak(credits, now)).toBe(1);
    });

    it('AC-S04: when an empty day passed, streak was 0, but next day writing credit makes it 1', () => {
      // Only today has credit, yesterday had none
      const credits = [
        createCredit(0, 1800),
        createCredit(2, 1800), // Gap on day 1
      ];

      expect(StreakCalculator.calculateStreak(credits, now)).toBe(1);
    });
  });
});
