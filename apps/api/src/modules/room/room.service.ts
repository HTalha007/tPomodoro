import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  StorePort,
  SecretPort,
  ClockPort,
  RoomModel,
  MembershipModel,
} from '@tpomodoro/domain';
import { STORE_PORT } from '../../infrastructure/database/drizzle-store.adapter';
import { SECRET_PORT } from '../../infrastructure/security/argon2-secret.adapter';
import { CLOCK_PORT } from '../../infrastructure/clock/system-clock.adapter';
import { RoomResponseDto, RoomMemberDto, JoinRoomDto } from '@tpomodoro/contracts';
import * as crypto from 'crypto';

@Injectable()
export class RoomService {
  constructor(
    @Inject(STORE_PORT) private readonly store: StorePort,
    @Inject(SECRET_PORT) private readonly secret: SecretPort,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async createRoom(hostAccountId: string): Promise<RoomResponseDto> {
    const now = this.clock.now();
    const roomId = crypto.randomUUID();
    const code = this.secret.generateRoomCode(); // AC-R01: >= 128-bit entropy

    const roomModel: RoomModel = {
      roomId,
      code,
      hostAccountId,
      createdAt: now,
    };

    const hostMembership: MembershipModel = {
      membershipId: crypto.randomUUID(),
      roomId,
      accountId: hostAccountId,
      joinedAt: now,
      leftAt: null,
      lastSeenAt: now,
    };

    const room = await this.store.createRoom(roomModel, hostMembership);
    return this.buildRoomResponse(room, hostAccountId);
  }

  async joinRoom(accountId: string, dto: JoinRoomDto): Promise<RoomResponseDto> {
    const code = dto.code?.trim();
    if (!code) {
      throw new NotFoundException('Room code is required.');
    }

    const room = await this.store.findRoomByCode(code);
    if (!room) {
      // AC-R03: Bilinmeyen kodla katılım reddedilir
      throw new NotFoundException('Room not found.');
    }

    const now = this.clock.now();
    const membership: MembershipModel = {
      membershipId: crypto.randomUUID(),
      roomId: room.roomId,
      accountId,
      joinedAt: now,
      leftAt: null,
      lastSeenAt: now,
    };

    // AC-R05: Başka odaya girmek önceki aktif üyeliği kapatır
    await this.store.joinRoom(membership);
    return this.buildRoomResponse(room, accountId);
  }

  async leaveCurrentRoom(accountId: string): Promise<{ success: boolean }> {
    const activeMembership = await this.store.findActiveMembership(accountId);
    if (activeMembership) {
      const now = this.clock.now();
      await this.store.leaveRoom(accountId, activeMembership.roomId, now);
    }
    return { success: true };
  }

  async getActiveRoom(accountId: string): Promise<RoomResponseDto | null> {
    const activeMembership = await this.store.findActiveMembership(accountId);
    if (!activeMembership) return null;

    const room = await this.store.findRoomById(activeMembership.roomId);
    if (!room) return null;

    return this.buildRoomResponse(room, accountId);
  }

  async pollRoom(accountId: string, roomId: string): Promise<RoomResponseDto> {
    const room = await this.store.findRoomById(roomId);
    if (!room) {
      // AC-R04: Bilinmeyen kod ile üyeliksiz okuma aynı reddi döner
      throw new NotFoundException('Room not found.');
    }

    const activeMembership = await this.store.findActiveMembership(accountId);
    if (!activeMembership || activeMembership.roomId !== roomId) {
      // AC-R04: Üye olmayan hesabın oda okuması reddedilir
      throw new NotFoundException('Room not found or you are not an active member.');
    }

    const now = this.clock.now();
    // AC-R10: Update last_seen_at
    await this.store.heartbeatMembership(accountId, roomId, now);

    return this.buildRoomResponse(room, accountId);
  }

  private async buildRoomResponse(
    room: RoomModel,
    requestingAccountId: string
  ): Promise<RoomResponseDto> {
    const now = this.clock.now();
    const activeMembers = await this.store.getRoomActiveMembers(room.roomId);

    // Calculate room scores for active members:
    // AC-R07: Sıralama, aktif üyelerin bu room_id ile yazılmış kredili saniyelerinin toplamıdır
    const memberDtos: RoomMemberDto[] = [];

    for (const member of activeMembers) {
      const account = await this.store.findAccountById(member.accountId);
      const credits = await this.store.getAllAccountCredits(member.accountId);

      // Sum credits tagged with this roomId
      const roomCreditsSum = credits
        .filter((c) => c.roomId === room.roomId)
        .reduce((sum, c) => sum + c.creditedSeconds, 0);

      // AC-R10: last_seen_at son 30 saniye içindeyse online, değilse uzakta
      const secondsSinceSeen = Math.floor(
        (now.getTime() - member.lastSeenAt.getTime()) / 1000
      );
      const isOnline = secondsSinceSeen <= 30;

      memberDtos.push({
        accountId: member.accountId,
        email: account ? account.email : 'Unknown',
        totalCreditedSeconds: roomCreditsSum,
        lastSeenAt: member.lastSeenAt.toISOString(),
        isOnline,
      });
    }

    // Sort descending by totalCreditedSeconds
    memberDtos.sort((a, b) => b.totalCreditedSeconds - a.totalCreditedSeconds);

    return {
      roomId: room.roomId,
      code: room.code,
      isHost: room.hostAccountId === requestingAccountId,
      members: memberDtos,
      serverNow: now.toISOString(),
    };
  }
}
