import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SystemClockAdapter, CLOCK_PORT } from './clock/system-clock.adapter';
import { Argon2SecretAdapter, SECRET_PORT } from './security/argon2-secret.adapter';
import { DrizzleStoreAdapter, STORE_PORT } from './database/drizzle-store.adapter';
import { InMemoryStoreAdapter } from './database/in-memory-store.adapter';
import { SmartStoreAdapter } from './database/smart-store.adapter';
import { AuthGuard } from './security/auth.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CLOCK_PORT,
      useClass: SystemClockAdapter,
    },
    {
      provide: SECRET_PORT,
      useClass: Argon2SecretAdapter,
    },
    DrizzleStoreAdapter,
    InMemoryStoreAdapter,
    {
      provide: STORE_PORT,
      useClass: SmartStoreAdapter,
    },
    AuthGuard,
  ],
  exports: [CLOCK_PORT, SECRET_PORT, STORE_PORT, AuthGuard],
})
export class InfrastructureModule {}
