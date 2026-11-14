import { Controller, Get, UseGuards } from '@nestjs/common';
import { SummaryService } from '../modules/summary/summary.service';
import { AuthGuard } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel } from '@tpomodoro/domain';
import { UserStatsDto } from '@tpomodoro/contracts';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('stats')
  async getUserStats(@CurrentAccount() account: AccountModel): Promise<UserStatsDto> {
    return this.summaryService.getUserStats(account.accountId);
  }
}
