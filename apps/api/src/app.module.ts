import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoundModule } from './modules/round/round.module';
import { RoomModule } from './modules/room/room.module';
import { SummaryModule } from './modules/summary/summary.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    InfrastructureModule,
    HealthModule,
    AuthModule,
    RoundModule,
    RoomModule,
    SummaryModule,
  ],
})
export class AppModule {}
