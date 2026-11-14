import {
  StorePort,
  AccountModel,
  RoundModel,
  CreditEntryModel,
  RoomModel,
  MembershipModel,
} from '../../src/index.js';

export class InMemoryStore implements StorePort {
  public accounts: Map<string, AccountModel> = new Map();
  public sessions: Map<string, { accountId: string; expiresAt: Date }> = new Map();
  public rounds: Map<string, RoundModel> = new Map();
  public creditEntries: CreditEntryModel[] = [];
  public rooms: Map<string, RoomModel> = new Map();
  public memberships: MembershipModel[] = [];

  // Accounts
  async findAccountByEmail(email: string): Promise<AccountModel | null> {
    for (const acc of this.accounts.values()) {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        return acc;
      }
    }
    return null;
  }

  async findAccountById(accountId: string): Promise<AccountModel | null> {
    return this.accounts.get(accountId) ?? null;
  }

  async createAccount(account: AccountModel): Promise<AccountModel> {
    this.accounts.set(account.accountId, { ...account });
    return account;
  }

  // Sessions
  async createSession(token: string, accountId: string, expiresAt: Date): Promise<void> {
    this.sessions.set(token, { accountId, expiresAt });
  }

  async findSession(token: string): Promise<{ accountId: string; expiresAt: Date } | null> {
    return this.sessions.get(token) ?? null;
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  // Rounds
  async findActiveRound(accountId: string): Promise<RoundModel | null> {
    for (const r of this.rounds.values()) {
      if (r.accountId === accountId && r.phase !== 'closed') {
        return { ...r };
      }
    }
    return null;
  }

  async findRoundById(roundId: string): Promise<RoundModel | null> {
    const r = this.rounds.get(roundId);
    return r ? { ...r } : null;
  }

  async createRound(round: RoundModel): Promise<RoundModel> {
    this.rounds.set(round.roundId, { ...round });
    return { ...round };
  }

  async updateRound(round: RoundModel): Promise<RoundModel> {
    this.rounds.set(round.roundId, { ...round });
    return { ...round };
  }

  async closeRoundAndRecordCredit(
    round: RoundModel,
    credit: CreditEntryModel
  ): Promise<{ round: RoundModel; credit: CreditEntryModel }> {
    this.rounds.set(round.roundId, { ...round, phase: 'closed' });

    const existing = this.creditEntries.find((c) => c.roundId === round.roundId);
    if (existing) {
      return { round: { ...round, phase: 'closed' }, credit: existing };
    }

    this.creditEntries.push({ ...credit });
    return { round: { ...round, phase: 'closed' }, credit };
  }

  // Credits
  async findCreditByRoundId(roundId: string): Promise<CreditEntryModel | null> {
    const found = this.creditEntries.find((c) => c.roundId === roundId);
    return found ? { ...found } : null;
  }

  async findCreditsByAccountAndDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<CreditEntryModel[]> {
    return this.creditEntries.filter(
      (c) => c.accountId === accountId && c.closedAt >= from && c.closedAt < to
    );
  }

  async getAllAccountCredits(accountId: string): Promise<CreditEntryModel[]> {
    return this.creditEntries.filter((c) => c.accountId === accountId);
  }

  // Rooms & Memberships
  async createRoom(room: RoomModel, hostMembership: MembershipModel): Promise<RoomModel> {
    // Close existing active membership for host
    for (const m of this.memberships) {
      if (m.accountId === hostMembership.accountId && !m.leftAt) {
        m.leftAt = hostMembership.joinedAt;
      }
    }

    this.rooms.set(room.roomId, { ...room });
    this.memberships.push({ ...hostMembership });
    return { ...room };
  }

  async findRoomByCode(code: string): Promise<RoomModel | null> {
    for (const r of this.rooms.values()) {
      if (r.code === code) return { ...r };
    }
    return null;
  }

  async findRoomById(roomId: string): Promise<RoomModel | null> {
    return this.rooms.get(roomId) ?? null;
  }

  async findActiveMembership(accountId: string): Promise<MembershipModel | null> {
    for (const m of this.memberships) {
      if (m.accountId === accountId && !m.leftAt) {
        return { ...m };
      }
    }
    return null;
  }

  async joinRoom(membership: MembershipModel): Promise<MembershipModel> {
    for (const m of this.memberships) {
      if (m.accountId === membership.accountId && !m.leftAt) {
        m.leftAt = membership.joinedAt;
      }
    }
    this.memberships.push({ ...membership });
    return { ...membership };
  }

  async leaveRoom(accountId: string, roomId: string, leftAt: Date): Promise<void> {
    for (const m of this.memberships) {
      if (m.accountId === accountId && m.roomId === roomId && !m.leftAt) {
        m.leftAt = leftAt;
      }
    }
  }

  async heartbeatMembership(
    accountId: string,
    roomId: string,
    lastSeenAt: Date
  ): Promise<void> {
    for (const m of this.memberships) {
      if (m.accountId === accountId && m.roomId === roomId && !m.leftAt) {
        m.lastSeenAt = lastSeenAt;
      }
    }
  }

  async getRoomActiveMembers(roomId: string): Promise<MembershipModel[]> {
    return this.memberships.filter((m) => m.roomId === roomId && !m.leftAt);
  }
}
