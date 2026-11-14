import { CreditEntryModel } from '../models/credit-entry.model.js';
import { PeriodCalculator } from './period.calculator.js';

export class StreakCalculator {
  /**
   * Calculates the current streak in consecutive days based on credit entries and current time.
   * AC-S01: Kredili saniyesi sıfırdan büyük yerel gün seriye sayılır. Yalnız 0 olan gün sayılmaz.
   * AC-S02: Bugünün kredisi varsa seri bugünden geriye kesintisiz günleri sayar.
   * AC-S03: Bugün henüz boşsa seri dünden geriye sayılır. Gün bitene kadar seri kopmuş sayılmaz. Dün de boşsa 0'dır.
   * AC-S04: Kredisiz gün bittiğinde seri 0 olur. Ertesi gün yazılan kredi seriyi 1 yapar.
   */
  public static calculateStreak(credits: CreditEntryModel[], now: Date): number {
    // 1. Group credited seconds by Istanbul date string 'YYYY-MM-DD'
    const dailyCreditSums = new Map<string, number>();

    for (const credit of credits) {
      if (credit.creditedSeconds <= 0) continue;
      const dateStr = PeriodCalculator.toIstanbulDateString(credit.closedAt);
      const currentSum = dailyCreditSums.get(dateStr) ?? 0;
      dailyCreditSums.set(dateStr, currentSum + credit.creditedSeconds);
    }

    // Set of days with > 0 credit
    const validDays = new Set<string>();
    for (const [day, sum] of dailyCreditSums.entries()) {
      if (sum > 0) {
        validDays.add(day);
      }
    }

    const todayDate = PeriodCalculator.getStartOfDay(now);
    const todayStr = PeriodCalculator.toIstanbulDateString(todayDate);

    // Helper to get date string for N days before today
    const getDaysAgoStr = (daysAgo: number): string => {
      const d = new Date(todayDate.getTime() - daysAgo * 24 * 3600 * 1000);
      return PeriodCalculator.toIstanbulDateString(d);
    };

    const hasTodayCredit = validDays.has(todayStr);

    if (hasTodayCredit) {
      // AC-S02: Start counting from today backwards
      let streak = 0;
      let checkDaysAgo = 0;
      while (validDays.has(getDaysAgoStr(checkDaysAgo))) {
        streak++;
        checkDaysAgo++;
      }
      return streak;
    } else {
      // AC-S03: Today is empty, count from yesterday backwards
      const yesterdayStr = getDaysAgoStr(1);
      if (!validDays.has(yesterdayStr)) {
        return 0; // Yesterday is also empty, streak is 0
      }

      let streak = 0;
      let checkDaysAgo = 1;
      while (validDays.has(getDaysAgoStr(checkDaysAgo))) {
        streak++;
        checkDaysAgo++;
      }
      return streak;
    }
  }
}
