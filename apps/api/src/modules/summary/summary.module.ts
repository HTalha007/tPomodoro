import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from '../../controllers/summary.controller';
import { UserController } from '../../controllers/user.controller';

@Module({
  controllers: [SummaryController, UserController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
