import { CreditEntryModel } from '../models/credit-entry.model.js';

export class PeriodCalculator {
  public static readonly TIMEZONE = 'Europe/Istanbul';

  /**
   * Formats a given Date to 'YYYY-MM-DD' in Europe/Istanbul timezone.
   */
  public static toIstanbulDateString(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /**
   * Gets start of day (00:00:00.000) for a given Date in Istanbul timezone.
   */
  public static getStartOfDay(date: Date): Date {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(date);

    const year = parseInt(parts.find((p) => p.type === 'year')!.value, 10);
    const month = parseInt(parts.find((p) => p.type === 'month')!.value, 10);
    const day = parseInt(parts.find((p) => p.type === 'day')!.value, 10);

    // Istanbul is UTC+3 permanently
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 3 * 3600 * 1000);
  }

  /**
   * Gets start of week (Monday 00:00:00.000) in Istanbul timezone.
   * Week starts Monday 00:00:00 and ends next Monday 00:00:00 (exclusive).
   */
  public static getStartOfWeek(date: Date): Date {
    const startOfDay = this.getStartOfDay(date);
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: this.TIMEZONE,
      weekday: 'short',
    }).format(date);

    const dayOffsets: Record<string, number> = {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
      Sun: 6,
    };

    const diffDays = dayOffsets[weekday] ?? 0;
    return new Date(startOfDay.getTime() - diffDays * 24 * 3600 * 1000);
  }

  /**
   * Determines if a closedAt timestamp belongs to "today" relative to the given now reference.
   */
  public static isToday(closedAt: Date, now: Date): boolean {
    const startOfToday = this.getStartOfDay(now);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 3600 * 1000);
    return closedAt >= startOfToday && closedAt < startOfTomorrow;
  }

  /**
   * Determines if a closedAt timestamp belongs to "this week" relative to now.
   * Monday 00:00:00 to next Monday 00:00:00.
   */
  public static isThisWeek(closedAt: Date, now: Date): boolean {
    const startOfThisWeek = this.getStartOfWeek(now);
    const startOfNextWeek = new Date(startOfThisWeek.getTime() + 7 * 24 * 3600 * 1000);
    return closedAt >= startOfThisWeek && closedAt < startOfNextWeek;
  }

  /**
   * Sums credited seconds for entries in today and this week.
   * AC-O01: Özet yalnız kredili saniyeyi toplar. 'abandoned' (0) toplamı artırmaz.
   * AC-O02: full ve half satırlar, closed_at hangi güne düşüyorsa o günün toplamına bir kez eklenir.
   */
  public static calculateSummary(
    credits: CreditEntryModel[],
    now: Date
  ): { todayCreditedSeconds: number; thisWeekCreditedSeconds: number } {
    let todayCreditedSeconds = 0;
    let thisWeekCreditedSeconds = 0;

    for (const entry of credits) {
      if (entry.creditedSeconds <= 0) continue;

      if (this.isToday(entry.closedAt, now)) {
        todayCreditedSeconds += entry.creditedSeconds;
      }
      if (this.isThisWeek(entry.closedAt, now)) {
        thisWeekCreditedSeconds += entry.creditedSeconds;
      }
    }

    return {
      todayCreditedSeconds,
      thisWeekCreditedSeconds,
    };
  }
}
