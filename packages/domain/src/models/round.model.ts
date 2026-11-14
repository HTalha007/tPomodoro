export type RoundPhase =
  | 'focus_before_break'
  | 'awaiting_decision'
  | 'focus_after_break'
  | 'closed';

export type RoundOutcome = 'abandoned' | 'half' | 'full';

export interface RoundModel {
  roundId: string;
  accountId: string;
  plannedSeconds: number;
  breakAfterSeconds: number;
  breakLengthSeconds: number;
  phase: RoundPhase;
  startedAt: Date;
  breakStartedAt?: Date | null;
  resumedAt?: Date | null;
  closedAt?: Date | null;
  outcome?: RoundOutcome | null;
}
