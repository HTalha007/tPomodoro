export interface SummaryResponseDto {
  todayCreditedSeconds: number;
  thisWeekCreditedSeconds: number;
  streakDays: number;
  serverNow: string;
}

export interface UserStatsDto {
  todayMinutes: number;
  todayCreditedSeconds: number;
  completedRoundsCount: number;
  weekMinutes: number;
  weekGoalMinutes: number;
  thisWeekCreditedSeconds: number;
  streakDays: number;
  serverNow: string;
}
