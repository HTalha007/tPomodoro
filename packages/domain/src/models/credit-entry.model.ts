import { RoundOutcome } from './round.model.js';

export interface CreditEntryModel {
  entryId: string;
  roundId: string;
  accountId: string;
  creditedSeconds: number;
  outcome: RoundOutcome;
  closedAt: Date;
  roomId?: string | null;
  createdAt: Date;
}
