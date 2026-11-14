import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RoomService } from '../modules/room/room.service';
import { JoinRoomDto, RoomResponseDto } from '@tpomodoro/contracts';
import { AuthGuard } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel } from '@tpomodoro/domain';

@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  async createRoom(@CurrentAccount() account: AccountModel): Promise<RoomResponseDto> {
    return this.roomService.createRoom(account.accountId);
  }

  @Post('join')
  async joinRoom(
    @CurrentAccount() account: AccountModel,
    @Body() dto: JoinRoomDto
  ): Promise<RoomResponseDto> {
    return this.roomService.joinRoom(account.accountId, dto);
  }

  @Post('leave')
  async leaveRoom(@CurrentAccount() account: AccountModel): Promise<{ success: boolean }> {
    return this.roomService.leaveCurrentRoom(account.accountId);
  }

  @Get('active')
  async getActiveRoom(
    @CurrentAccount() account: AccountModel
  ): Promise<{ room: RoomResponseDto | null }> {
    const room = await this.roomService.getActiveRoom(account.accountId);
    return { room };
  }

  @Post(':roomId/poll')
  async pollRoom(
    @CurrentAccount() account: AccountModel,
    @Param('roomId') roomId: string
  ): Promise<RoomResponseDto> {
    return this.roomService.pollRoom(account.accountId, roomId);
  }
}
