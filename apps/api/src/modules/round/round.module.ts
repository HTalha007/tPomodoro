import { Module } from '@nestjs/common';
import { RoundService } from './round.service';
import { RoundController } from '../../controllers/round.controller';
import { SessionController } from '../../controllers/session.controller';

@Module({
  controllers: [RoundController, SessionController],
  providers: [RoundService],
  exports: [RoundService],
})
export class RoundModule {}
