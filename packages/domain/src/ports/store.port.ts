import { AccountModel } from '../models/account.model.js';
import { RoundModel } from '../models/round.model.js';
import { CreditEntryModel } from '../models/credit-entry.model.js';
import { RoomModel, MembershipModel } from '../models/room.model.js';

export interface StorePort {
  // Accounts
  findAccountByEmail(email: string): Promise<AccountModel | null>;
  findAccountById(accountId: string): Promise<AccountModel | null>;
  createAccount(account: AccountModel): Promise<AccountModel>;

  // Sessions
  createSession(token: string, accountId: string, expiresAt: Date): Promise<void>;
  findSession(token: string): Promise<{ accountId: string; expiresAt: Date } | null>;
  deleteSession(token: string): Promise<void>;

  // Rounds
  findActiveRound(accountId: string): Promise<RoundModel | null>;
  findRoundById(roundId: string): Promise<RoundModel | null>;
  createRound(round: RoundModel): Promise<RoundModel>;
  updateRound(round: RoundModel): Promise<RoundModel>;
  closeRoundAndRecordCredit(
    round: RoundModel,
    credit: CreditEntryModel
  ): Promise<{ round: RoundModel; credit: CreditEntryModel }>;

  // Credits & Stats
  findCreditByRoundId(roundId: string): Promise<CreditEntryModel | null>;
  findCreditsByAccountAndDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<CreditEntryModel[]>;
  getAllAccountCredits(accountId: string): Promise<CreditEntryModel[]>;

  // Rooms & Memberships
  createRoom(room: RoomModel, hostMembership: MembershipModel): Promise<RoomModel>;
  findRoomByCode(code: string): Promise<RoomModel | null>;
  findRoomById(roomId: string): Promise<RoomModel | null>;
  findActiveMembership(accountId: string): Promise<MembershipModel | null>;
  joinRoom(membership: MembershipModel): Promise<MembershipModel>;
  leaveRoom(accountId: string, roomId: string, leftAt: Date): Promise<void>;
  heartbeatMembership(accountId: string, roomId: string, lastSeenAt: Date): Promise<void>;
  getRoomActiveMembers(roomId: string): Promise<MembershipModel[]>;
}
