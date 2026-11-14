import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { RoundService } from '../modules/round/round.service';
import { AuthGuard } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel, ClockPort } from '@tpomodoro/domain';
import { CurrentSessionResponseDto } from '@tpomodoro/contracts';
import { CLOCK_PORT } from '../infrastructure/clock/system-clock.adapter';

@Controller('session')
@UseGuards(AuthGuard)
export class SessionController {
  constructor(
    private readonly roundService: RoundService,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  @Get('current')
  async getCurrentSession(
    @CurrentAccount() account: AccountModel
  ): Promise<CurrentSessionResponseDto> {
    const round = await this.roundService.getActiveRound(account.accountId);
    return {
      hasActiveRound: round !== null,
      round,
      serverNow: this.clock.now().toISOString(),
    };
  }
}
