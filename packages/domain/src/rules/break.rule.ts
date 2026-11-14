export class BreakRule {
  public static readonly MIN_MINUTES = 15;
  public static readonly MAX_MINUTES = 180;
  public static readonly LONG_BREAK_THRESHOLD_SECONDS = 2700; // 45 minutes
  public static readonly SHORT_BREAK_SECONDS = 300; // 5 minutes
  public static readonly LONG_BREAK_SECONDS = 900; // 15 minutes

  /**
   * Validates if the planned duration in minutes is allowed (15 to 180 min).
   * AC-K13: 14 and 181 are rejected, 15 and 180 are accepted.
   */
  public static validatePlannedMinutes(minutes: number): boolean {
    return Number.isInteger(minutes) && minutes >= this.MIN_MINUTES && minutes <= this.MAX_MINUTES;
  }

  /**
   * Calculates the break point in seconds (2/3 ratio).
   * AC-K01: floor(planned_seconds * 2 / 3)
   */
  public static calculateBreakAfterSeconds(plannedSeconds: number): number {
    return Math.floor((plannedSeconds * 2) / 3);
  }

  /**
   * Determines whether break is 300s (5m) or 900s (15m).
   * If breakAfterSeconds >= 2700 (45m) -> 900s, else 300s.
   * AC-K01, AC-K02, AC-K03.
   */
  public static calculateBreakLengthSeconds(breakAfterSeconds: number): number {
    return breakAfterSeconds >= this.LONG_BREAK_THRESHOLD_SECONDS
      ? this.LONG_BREAK_SECONDS
      : this.SHORT_BREAK_SECONDS;
  }
}
