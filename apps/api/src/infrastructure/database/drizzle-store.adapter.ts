import { Injectable, Inject } from '@nestjs/common';
import {
  StorePort,
  AccountModel,
  RoundModel,
  CreditEntryModel,
  RoomModel,
  MembershipModel,
  RoundPhase,
  RoundOutcome,
} from '@tpomodoro/domain';
import { eq, and, isNull, ne, gte, lt, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDb } from './database.provider';
import {
  accounts,
  sessions,
  rounds,
  creditEntries,
  rooms,
  memberships,
} from './schema';

export const STORE_PORT = 'STORE_PORT';

@Injectable()
export class DrizzleStoreAdapter implements StorePort {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DrizzleDb) {}

  // ----------------- Accounts -----------------
  async findAccountByEmail(email: string): Promise<AccountModel | null> {
    const rows = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email.toLowerCase().trim()))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      accountId: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      timezone: row.timezone,
      createdAt: row.createdAt,
    };
  }

  async findAccountById(accountId: string): Promise<AccountModel | null> {
    const rows = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      accountId: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      timezone: row.timezone,
      createdAt: row.createdAt,
    };
  }

  async createAccount(account: AccountModel): Promise<AccountModel> {
    const [row] = await this.db
      .insert(accounts)
      .values({
        id: account.accountId,
        email: account.email.toLowerCase().trim(),
        passwordHash: account.passwordHash,
        timezone: account.timezone || 'Europe/Istanbul',
        createdAt: account.createdAt,
      })
      .returning();

    return {
      accountId: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      timezone: row.timezone,
      createdAt: row.createdAt,
    };
  }

  // ----------------- Sessions -----------------
  async createSession(token: string, accountId: string, expiresAt: Date): Promise<void> {
    await this.db.insert(sessions).values({
      token,
      accountId,
      expiresAt,
    });
  }

  async findSession(token: string): Promise<{ accountId: string; expiresAt: Date } | null> {
    const rows = await this.db
      .select({ accountId: sessions.accountId, expiresAt: sessions.expiresAt })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0];
  }

  async deleteSession(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }

  // ----------------- Rounds -----------------
  async findActiveRound(accountId: string): Promise<RoundModel | null> {
    const rows = await this.db
      .select()
      .from(rounds)
      .where(and(eq(rounds.accountId, accountId), ne(rounds.phase, 'closed')))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapRoundRow(rows[0]);
  }

  async findRoundById(roundId: string): Promise<RoundModel | null> {
    const rows = await this.db
      .select()
      .from(rounds)
      .where(eq(rounds.id, roundId))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapRoundRow(rows[0]);
  }

  async createRound(round: RoundModel): Promise<RoundModel> {
    const [row] = await this.db
      .insert(rounds)
      .values({
        id: round.roundId,
        accountId: round.accountId,
        plannedSeconds: round.plannedSeconds,
        breakAfterSeconds: round.breakAfterSeconds,
        breakLengthSeconds: round.breakLengthSeconds,
        phase: round.phase,
        startedAt: round.startedAt,
        breakStartedAt: round.breakStartedAt,
        resumedAt: round.resumedAt,
        closedAt: round.closedAt,
        outcome: round.outcome,
      })
      .returning();

    return this.mapRoundRow(row);
  }

  async updateRound(round: RoundModel): Promise<RoundModel> {
    const [row] = await this.db
      .update(rounds)
      .set({
        phase: round.phase,
        breakStartedAt: round.breakStartedAt,
        resumedAt: round.resumedAt,
        closedAt: round.closedAt,
        outcome: round.outcome,
      })
      .where(eq(rounds.id, round.roundId))
      .returning();

    return this.mapRoundRow(row);
  }

  async closeRoundAndRecordCredit(
    round: RoundModel,
    credit: CreditEntryModel
  ): Promise<{ round: RoundModel; credit: CreditEntryModel }> {
    return await this.db.transaction(async (tx) => {
      // 1. Update round to closed
      const [updatedRoundRow] = await tx
        .update(rounds)
        .set({
          phase: 'closed',
          closedAt: round.closedAt,
          outcome: round.outcome,
        })
        .where(eq(rounds.id, round.roundId))
        .returning();

      // 2. Check if a credit entry already exists for this round (idempotency, AC-K09)
      const existingCredits = await tx
        .select()
        .from(creditEntries)
        .where(eq(creditEntries.roundId, round.roundId))
        .limit(1);

      if (existingCredits.length > 0) {
        return {
          round: this.mapRoundRow(updatedRoundRow),
          credit: this.mapCreditRow(existingCredits[0]),
        };
      }

      // 3. Insert unique credit row
      const [newCreditRow] = await tx
        .insert(creditEntries)
        .values({
          id: credit.entryId,
          roundId: credit.roundId,
          accountId: credit.accountId,
          creditedSeconds: credit.creditedSeconds,
          outcome: credit.outcome,
          closedAt: credit.closedAt,
          roomId: credit.roomId,
          createdAt: credit.createdAt,
        })
        .returning();

      return {
        round: this.mapRoundRow(updatedRoundRow),
        credit: this.mapCreditRow(newCreditRow),
      };
    });
  }

  // ----------------- Credits & Stats -----------------
  async findCreditByRoundId(roundId: string): Promise<CreditEntryModel | null> {
    const rows = await this.db
      .select()
      .from(creditEntries)
      .where(eq(creditEntries.roundId, roundId))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapCreditRow(rows[0]);
  }

  async findCreditsByAccountAndDateRange(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<CreditEntryModel[]> {
    const rows = await this.db
      .select()
      .from(creditEntries)
      .where(
        and(
          eq(creditEntries.accountId, accountId),
          gte(creditEntries.closedAt, from),
          lt(creditEntries.closedAt, to)
        )
      );

    return rows.map((r) => this.mapCreditRow(r));
  }

  async getAllAccountCredits(accountId: string): Promise<CreditEntryModel[]> {
    const rows = await this.db
      .select()
      .from(creditEntries)
      .where(eq(creditEntries.accountId, accountId))
      .orderBy(desc(creditEntries.closedAt));

    return rows.map((r) => this.mapCreditRow(r));
  }

  // ----------------- Rooms & Memberships -----------------
  async createRoom(room: RoomModel, hostMembership: MembershipModel): Promise<RoomModel> {
    return await this.db.transaction(async (tx) => {
      // Deactivate any existing active membership for this account (AC-R05)
      await tx
        .update(memberships)
        .set({ leftAt: hostMembership.joinedAt })
        .where(
          and(
            eq(memberships.accountId, hostMembership.accountId),
            isNull(memberships.leftAt)
          )
        );

      const [newRoom] = await tx
        .insert(rooms)
        .values({
          id: room.roomId,
          code: room.code,
          hostAccountId: room.hostAccountId,
          createdAt: room.createdAt,
        })
        .returning();

      await tx.insert(memberships).values({
        id: hostMembership.membershipId,
        roomId: newRoom.id,
        accountId: hostMembership.accountId,
        joinedAt: hostMembership.joinedAt,
        leftAt: null,
        lastSeenAt: hostMembership.lastSeenAt,
      });

      return {
        roomId: newRoom.id,
        code: newRoom.code,
        hostAccountId: newRoom.hostAccountId,
        createdAt: newRoom.createdAt,
      };
    });
  }

  async findRoomByCode(code: string): Promise<RoomModel | null> {
    const rows = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.code, code))
      .limit(1);

    if (rows.length === 0) return null;
    return {
      roomId: rows[0].id,
      code: rows[0].code,
      hostAccountId: rows[0].hostAccountId,
      createdAt: rows[0].createdAt,
    };
  }

  async findRoomById(roomId: string): Promise<RoomModel | null> {
    const rows = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (rows.length === 0) return null;
    return {
      roomId: rows[0].id,
      code: rows[0].code,
      hostAccountId: rows[0].hostAccountId,
      createdAt: rows[0].createdAt,
    };
  }

  async findActiveMembership(accountId: string): Promise<MembershipModel | null> {
    const rows = await this.db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.accountId, accountId), isNull(memberships.leftAt))
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapMembershipRow(rows[0]);
  }

  async joinRoom(membership: MembershipModel): Promise<MembershipModel> {
    return await this.db.transaction(async (tx) => {
      // Close previous active membership (AC-R05)
      await tx
        .update(memberships)
        .set({ leftAt: membership.joinedAt })
        .where(
          and(
            eq(memberships.accountId, membership.accountId),
            isNull(memberships.leftAt)
          )
        );

      const [row] = await tx
        .insert(memberships)
        .values({
          id: membership.membershipId,
          roomId: membership.roomId,
          accountId: membership.accountId,
          joinedAt: membership.joinedAt,
          leftAt: null,
          lastSeenAt: membership.lastSeenAt,
        })
        .returning();

      return this.mapMembershipRow(row);
    });
  }

  async leaveRoom(accountId: string, roomId: string, leftAt: Date): Promise<void> {
    await this.db
      .update(memberships)
      .set({ leftAt })
      .where(
        and(
          eq(memberships.accountId, accountId),
          eq(memberships.roomId, roomId),
          isNull(memberships.leftAt)
        )
      );
  }

  async heartbeatMembership(
    accountId: string,
    roomId: string,
    lastSeenAt: Date
  ): Promise<void> {
    await this.db
      .update(memberships)
      .set({ lastSeenAt })
      .where(
        and(
          eq(memberships.accountId, accountId),
          eq(memberships.roomId, roomId),
          isNull(memberships.leftAt)
        )
      );
  }

  async getRoomActiveMembers(roomId: string): Promise<MembershipModel[]> {
    const rows = await this.db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.roomId, roomId), isNull(memberships.leftAt))
      );

    return rows.map((r) => this.mapMembershipRow(r));
  }

  // ----------------- Helpers -----------------
  private mapRoundRow(row: typeof rounds.$inferSelect): RoundModel {
    return {
      roundId: row.id,
      accountId: row.accountId,
      plannedSeconds: row.plannedSeconds,
      breakAfterSeconds: row.breakAfterSeconds,
      breakLengthSeconds: row.breakLengthSeconds,
      phase: row.phase as RoundPhase,
      startedAt: row.startedAt,
      breakStartedAt: row.breakStartedAt,
      resumedAt: row.resumedAt,
      closedAt: row.closedAt,
      outcome: row.outcome as RoundOutcome | null,
    };
  }

  private mapCreditRow(row: typeof creditEntries.$inferSelect): CreditEntryModel {
    return {
      entryId: row.id,
      roundId: row.roundId,
      accountId: row.accountId,
      creditedSeconds: row.creditedSeconds,
      outcome: row.outcome as RoundOutcome,
      closedAt: row.closedAt,
      roomId: row.roomId,
      createdAt: row.createdAt,
    };
  }

  private mapMembershipRow(row: typeof memberships.$inferSelect): MembershipModel {
    return {
      membershipId: row.id,
      roomId: row.roomId,
      accountId: row.accountId,
      joinedAt: row.joinedAt,
      leftAt: row.leftAt,
      lastSeenAt: row.lastSeenAt,
    };
  }
}
