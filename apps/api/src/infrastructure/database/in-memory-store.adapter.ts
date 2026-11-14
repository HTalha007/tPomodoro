import { Injectable } from '@nestjs/common';
import {
  StorePort,
  AccountModel,
  RoundModel,
  CreditEntryModel,
  RoomModel,
  MembershipModel,
} from '@tpomodoro/domain';
import * as argon2 from 'argon2';

@Injectable()
export class InMemoryStoreAdapter implements StorePort {
  public accounts: Map<string, AccountModel> = new Map();
  public sessions: Map<string, { accountId: string; expiresAt: Date }> = new Map();
  public rounds: Map<string, RoundModel> = new Map();
  public creditEntries: CreditEntryModel[] = [];
  public rooms: Map<string, RoomModel> = new Map();
  public memberships: MembershipModel[] = [];

  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const passwordHash = await argon2.hash('Password123!', {
        type: argon2.argon2id,
      });

      const now = new Date();
      const keremId = 'user-kerem-dev';
      const zeynepId = 'user-zeynep-dev';

      // 1. Seed Accounts
      this.accounts.set(keremId, {
        accountId: keremId,
        email: 'kerem@example.com',
        passwordHash,
        timezone: 'Europe/Istanbul',
        createdAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000),
      });

      this.accounts.set(zeynepId, {
        accountId: zeynepId,
        email: 'zeynep@example.com',
        passwordHash,
        timezone: 'Europe/Istanbul',
        createdAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000),
      });

      // 2. Seed Sample Coworking Room
      const roomId = 'room-dev-quiet';
      const roomCode = 'a1b2c3d4e5f678901234567890abcdef';

      this.rooms.set(roomId, {
        roomId,
        code: roomCode,
        hostAccountId: keremId,
        createdAt: now,
      });

      this.memberships.push({
        membershipId: 'mem-kerem-1',
        roomId,
        accountId: keremId,
        joinedAt: now,
        leftAt: null,
        lastSeenAt: now,
      });

      this.memberships.push({
        membershipId: 'mem-zeynep-1',
        roomId,
        accountId: zeynepId,
        joinedAt: now,
        leftAt: null,
        lastSeenAt: now,
      });

      // 3. Seed sample past credits for realistic dashboard (Today, Yesterday, 2 days ago)
      const today = now;
      const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

      this.creditEntries.push(
        {
          entryId: 'credit-1',
          roundId: 'r-seed-1',
          accountId: keremId,
          creditedSeconds: 2700, // 45 dk
          outcome: 'full',
          closedAt: today,
          roomId,
          createdAt: today,
        },
        {
          entryId: 'credit-2',
          roundId: 'r-seed-2',
          accountId: keremId,
          creditedSeconds: 2700,
          outcome: 'full',
          closedAt: yesterday,
          roomId,
          createdAt: yesterday,
        },
        {
          entryId: 'credit-3',
          roundId: 'r-seed-3',
          accountId: keremId,
          creditedSeconds: 2700,
          outcome: 'full',
          closedAt: twoDaysAgo,
          roomId,
          createdAt: twoDaysAgo,
        },
        {
          entryId: 'credit-4',
          roundId: 'r-seed-4',
          accountId: zeynepId,
          creditedSeconds: 1800,
          outcome: 'full',
          closedAt: today,
          roomId,
          createdAt: today,
        }
      );

      this.isInitialized = true;
      console.log('🌱 InMemoryStore seeded with @kerem, @zeynep, and dev room!');
    } catch (err) {
      console.error('Error seeding InMemoryStore:', err);
    }
  }

  private async ensureReady() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  // ----------------- Accounts -----------------
  async findAccountByEmail(email: string): Promise<AccountModel | null> {
    await this.ensureReady();
    for (const acc of this.accounts.values()) {
      if (acc.email.toLowerCase() === email.toLowerCase().trim()) {
        return { ...acc };
      }
    }
    return null;
  }

  async findAccountById(accountId: string): Promise<AccountModel | null> {
    await this.ensureReady();
    const acc = this.accounts.get(accountId);
    return acc ? { ...acc } : null;
  }

  async createAccount(account: AccountModel): Promise<AccountModel> {
    await this.ensureReady();
    this.accounts.set(account.accountId, { ...account });
    return { ...account };
  }

  // ----------------- Sessions -----------------
  async createSession(token: string, accountId: string, expiresAt: Date): Promise<void> {
    await this.ensureReady();
    this.sessions.set(token, { accountId, expiresAt });
  }

  async findSession(token: string): Promise<{ accountId: string; expiresAt: Date } | null> {
    await this.ensureReady();
    return this.sessions.get(token) ?? null;
  }

  async deleteSession(token: string): Promise<void> {
    await this.ensureReady();
    this.sessions.delete(token);
  }

  // ----------------- Rounds -----------------
  async findActiveRound(accountId: string): Promise<RoundModel | null> {
    await this.ensureReady();
    for (const r of this.rounds.values()) {
      if (r.accountId === accountId && r.phase !== 'closed') {
        return { ...r };
      }
    }
    return null;
  }

  async findRoundById(roundId: string): Promise<RoundModel | null> {
    await this.ensureReady();
    const r = this.rounds.get(roundId);
    return r ? { ...r } : null;
  }

  async createRound(round: RoundModel): Promise<RoundModel> {
    await this.ensureReady();
    this.rounds.set(round.roundId, { ...round });
    return { ...round };
  }

  async updateRound(round: RoundModel): Promise<RoundModel> {
    await this.ensureReady();
    this.rounds.set(round.roundId, { ...round });
    return { ...round };
  }

  async closeRoundAndRecordCredit(
    round: RoundModel,
    credit: CreditEntryModel
  ): Promise<{ round: RoundModel; credit: CreditEntryModel }> {
    await this.ensureReady();
    const updated = { ...round, phase: 'closed' as const };
    this.rounds.set(round.roundId, updated);

    const existingIdx = this.creditEntries.findIndex((c) => c.roundId === round.roundId);
    if (existingIdx >= 0) {
      return { round: updated, credit: this.creditEntries[existingIdx] };
    }

    this.creditEntries.push({ ...credit });
    return { round: updated, credit };
  }

  // ----------------- Credits -----------------
  async findCreditByRoundId(roundId: string): Promise<CreditEntryModel | null> {
    await this.ensureReady();
    const found = this.creditEntries.find((c) => c.roundId === roundId);
    return found ? { ...found } : null;
  }

  async findCreditsByAccountAndDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<CreditEntryModel[]> {
    await this.ensureReady();
    return this.creditEntries.filter(
      (c) => c.accountId === accountId && c.closedAt >= from && c.closedAt < to
    );
  }

  async getAllAccountCredits(accountId: string): Promise<CreditEntryModel[]> {
    await this.ensureReady();
    return this.creditEntries.filter((c) => c.accountId === accountId);
  }

  // ----------------- Rooms & Memberships -----------------
  async createRoom(room: RoomModel, hostMembership: MembershipModel): Promise<RoomModel> {
    await this.ensureReady();
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
    await this.ensureReady();
    for (const r of this.rooms.values()) {
      if (r.code === code) return { ...r };
    }
    return null;
  }

  async findRoomById(roomId: string): Promise<RoomModel | null> {
    await this.ensureReady();
    return this.rooms.get(roomId) ?? null;
  }

  async findActiveMembership(accountId: string): Promise<MembershipModel | null> {
    await this.ensureReady();
    for (const m of this.memberships) {
      if (m.accountId === accountId && !m.leftAt) {
        return { ...m };
      }
    }
    return null;
  }

  async joinRoom(membership: MembershipModel): Promise<MembershipModel> {
    await this.ensureReady();
    for (const m of this.memberships) {
      if (m.accountId === membership.accountId && !m.leftAt) {
        m.leftAt = membership.joinedAt;
      }
    }
    this.memberships.push({ ...membership });
    return { ...membership };
  }

  async leaveRoom(accountId: string, roomId: string, leftAt: Date): Promise<void> {
    await this.ensureReady();
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
    await this.ensureReady();
    for (const m of this.memberships) {
      if (m.accountId === accountId && m.roomId === roomId && !m.leftAt) {
        m.lastSeenAt = lastSeenAt;
      }
    }
  }

  async getRoomActiveMembers(roomId: string): Promise<MembershipModel[]> {
    await this.ensureReady();
    return this.memberships.filter((m) => m.roomId === roomId && !m.leftAt);
  }
}
