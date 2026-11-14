import { Controller, Get, UseGuards } from '@nestjs/common';
import { SummaryService } from '../modules/summary/summary.service';
import { SummaryResponseDto } from '@tpomodoro/contracts';
import { AuthGuard } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel } from '@tpomodoro/domain';

@Controller('summary')
@UseGuards(AuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  async getSummary(@CurrentAccount() account: AccountModel): Promise<SummaryResponseDto> {
    return this.summaryService.getSummary(account.accountId);
  }
}
