import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { RoundService } from '../modules/round/round.service';
import { StartRoundDto, RoundResponseDto } from '@tpomodoro/contracts';
import { AuthGuard } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel } from '@tpomodoro/domain';

@Controller('rounds')
@UseGuards(AuthGuard)
export class RoundController {
  constructor(private readonly roundService: RoundService) {}

  @Post('start')
  async startRound(
    @CurrentAccount() account: AccountModel,
    @Body() dto: StartRoundDto
  ): Promise<RoundResponseDto> {
    return this.roundService.startRound(account.accountId, dto);
  }

  @Get('active')
  async getActiveRound(
    @CurrentAccount() account: AccountModel
  ): Promise<{ round: RoundResponseDto | null }> {
    const round = await this.roundService.getActiveRound(account.accountId);
    return { round };
  }

  @Post('resume')
  async resumeRound(
    @CurrentAccount() account: AccountModel
  ): Promise<RoundResponseDto> {
    return this.roundService.resumeRound(account.accountId);
  }

  @Post('abandon')
  async abandonRound(
    @CurrentAccount() account: AccountModel
  ): Promise<RoundResponseDto> {
    return this.roundService.abandonRound(account.accountId);
  }
}
