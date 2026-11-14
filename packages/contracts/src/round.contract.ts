export type RoundPhaseContract =
  | 'focus_before_break'
  | 'awaiting_decision'
  | 'focus_after_break'
  | 'closed';

export type RoundOutcomeContract = 'abandoned' | 'half' | 'full';

export interface StartRoundDto {
  plannedMinutes: number; // 15 to 180
}

export interface RoundResponseDto {
  roundId: string;
  plannedSeconds: number;
  breakAfterSeconds: number;
  breakLengthSeconds: number;
  phase: RoundPhaseContract;
  startedAt: string;
  breakStartedAt?: string | null;
  resumedAt?: string | null;
  closedAt?: string | null;
  outcome?: RoundOutcomeContract | null;
  serverNow: string; // Server timestamp for client countdown derivation
}

export interface CurrentSessionResponseDto {
  hasActiveRound: boolean;
  round: RoundResponseDto | null;
  serverNow: string;
}
