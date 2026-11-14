import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import {
  StorePort,
  AccountModel,
  RoundModel,
  CreditEntryModel,
  RoomModel,
  MembershipModel,
} from '@tpomodoro/domain';
import { sql } from 'drizzle-orm';
import { DrizzleStoreAdapter } from './drizzle-store.adapter';
import { InMemoryStoreAdapter } from './in-memory-store.adapter';
import { DRIZZLE_PROVIDER, DrizzleDb } from './database.provider';

@Injectable()
export class SmartStoreAdapter implements StorePort, OnModuleInit {
  private isFallback = false;

  constructor(
    private readonly drizzleStore: DrizzleStoreAdapter,
    private readonly memoryStore: InMemoryStoreAdapter,
    @Inject(DRIZZLE_PROVIDER) private readonly db: DrizzleDb
  ) {}

  async onModuleInit() {
    try {
      await this.db.execute(sql`SELECT 1`);
      this.isFallback = false;
      console.log('✅ [Database] PostgreSQL bağlantısı aktif! Drizzle ORM kullanılıyor.');
    } catch {
      this.isFallback = true;
      console.log(
        '⚠️ [Database] PostgreSQL bağlantısı kurulamadı. Geliştirici In-Memory Modu devreye alındı. Test hesapları (@kerem, @zeynep) hazır.'
      );
    }
  }

  private async getStore(): Promise<StorePort> {
    if (this.isFallback) {
      return this.memoryStore;
    }
    return this.drizzleStore;
  }

  // ----------------- Accounts -----------------
  async findAccountByEmail(email: string): Promise<AccountModel | null> {
    try {
      const store = await this.getStore();
      return await store.findAccountByEmail(email);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findAccountByEmail(email);
    }
  }

  async findAccountById(accountId: string): Promise<AccountModel | null> {
    try {
      const store = await this.getStore();
      return await store.findAccountById(accountId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findAccountById(accountId);
    }
  }

  async createAccount(account: AccountModel): Promise<AccountModel> {
    try {
      const store = await this.getStore();
      return await store.createAccount(account);
    } catch {
      this.isFallback = true;
      return this.memoryStore.createAccount(account);
    }
  }

  // ----------------- Sessions -----------------
  async createSession(token: string, accountId: string, expiresAt: Date): Promise<void> {
    try {
      const store = await this.getStore();
      return await store.createSession(token, accountId, expiresAt);
    } catch {
      this.isFallback = true;
      return this.memoryStore.createSession(token, accountId, expiresAt);
    }
  }

  async findSession(token: string): Promise<{ accountId: string; expiresAt: Date } | null> {
    try {
      const store = await this.getStore();
      return await store.findSession(token);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findSession(token);
    }
  }

  async deleteSession(token: string): Promise<void> {
    try {
      const store = await this.getStore();
      return await store.deleteSession(token);
    } catch {
      this.isFallback = true;
      return this.memoryStore.deleteSession(token);
    }
  }

  // ----------------- Rounds -----------------
  async findActiveRound(accountId: string): Promise<RoundModel | null> {
    try {
      const store = await this.getStore();
      return await store.findActiveRound(accountId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findActiveRound(accountId);
    }
  }

  async findRoundById(roundId: string): Promise<RoundModel | null> {
    try {
      const store = await this.getStore();
      return await store.findRoundById(roundId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findRoundById(roundId);
    }
  }

  async createRound(round: RoundModel): Promise<RoundModel> {
    try {
      const store = await this.getStore();
      return await store.createRound(round);
    } catch {
      this.isFallback = true;
      return this.memoryStore.createRound(round);
    }
  }

  async updateRound(round: RoundModel): Promise<RoundModel> {
    try {
      const store = await this.getStore();
      return await store.updateRound(round);
    } catch {
      this.isFallback = true;
      return this.memoryStore.updateRound(round);
    }
  }

  async closeRoundAndRecordCredit(
    round: RoundModel,
    credit: CreditEntryModel
  ): Promise<{ round: RoundModel; credit: CreditEntryModel }> {
    try {
      const store = await this.getStore();
      return await store.closeRoundAndRecordCredit(round, credit);
    } catch {
      this.isFallback = true;
      return this.memoryStore.closeRoundAndRecordCredit(round, credit);
    }
  }

  // ----------------- Credits -----------------
  async findCreditByRoundId(roundId: string): Promise<CreditEntryModel | null> {
    try {
      const store = await this.getStore();
      return await store.findCreditByRoundId(roundId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findCreditByRoundId(roundId);
    }
  }

  async findCreditsByAccountAndDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<CreditEntryModel[]> {
    try {
      const store = await this.getStore();
      return await store.findCreditsByAccountAndDateRange(accountId, from, to);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findCreditsByAccountAndDateRange(accountId, from, to);
    }
  }

  async getAllAccountCredits(accountId: string): Promise<CreditEntryModel[]> {
    try {
      const store = await this.getStore();
      return await store.getAllAccountCredits(accountId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.getAllAccountCredits(accountId);
    }
  }

  // ----------------- Rooms & Memberships -----------------
  async createRoom(room: RoomModel, hostMembership: MembershipModel): Promise<RoomModel> {
    try {
      const store = await this.getStore();
      return await store.createRoom(room, hostMembership);
    } catch {
      this.isFallback = true;
      return this.memoryStore.createRoom(room, hostMembership);
    }
  }

  async findRoomByCode(code: string): Promise<RoomModel | null> {
    try {
      const store = await this.getStore();
      return await store.findRoomByCode(code);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findRoomByCode(code);
    }
  }

  async findRoomById(roomId: string): Promise<RoomModel | null> {
    try {
      const store = await this.getStore();
      return await store.findRoomById(roomId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findRoomById(roomId);
    }
  }

  async findActiveMembership(accountId: string): Promise<MembershipModel | null> {
    try {
      const store = await this.getStore();
      return await store.findActiveMembership(accountId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.findActiveMembership(accountId);
    }
  }

  async joinRoom(membership: MembershipModel): Promise<MembershipModel> {
    try {
      const store = await this.getStore();
      return await store.joinRoom(membership);
    } catch {
      this.isFallback = true;
      return this.memoryStore.joinRoom(membership);
    }
  }

  async leaveRoom(accountId: string, roomId: string, leftAt: Date): Promise<void> {
    try {
      const store = await this.getStore();
      return await store.leaveRoom(accountId, roomId, leftAt);
    } catch {
      this.isFallback = true;
      return this.memoryStore.leaveRoom(accountId, roomId, leftAt);
    }
  }

  async heartbeatMembership(
    accountId: string,
    roomId: string,
    lastSeenAt: Date
  ): Promise<void> {
    try {
      const store = await this.getStore();
      return await store.heartbeatMembership(accountId, roomId, lastSeenAt);
    } catch {
      this.isFallback = true;
      return this.memoryStore.heartbeatMembership(accountId, roomId, lastSeenAt);
    }
  }

  async getRoomActiveMembers(roomId: string): Promise<MembershipModel[]> {
    try {
      const store = await this.getStore();
      return await store.getRoomActiveMembers(roomId);
    } catch {
      this.isFallback = true;
      return this.memoryStore.getRoomActiveMembers(roomId);
    }
  }
}
