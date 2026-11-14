import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDb } from '../../infrastructure/database/database.provider';
import { ClockPort } from '@tpomodoro/domain';
import { CLOCK_PORT } from '../../infrastructure/clock/system-clock.adapter';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: DrizzleDb,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async checkHealth(): Promise<{
    status: 'ok' | 'error';
    database: 'connected' | 'in-memory-fallback';
    serverTime: string;
    uptimeSeconds: number;
  }> {
    let dbStatus: 'connected' | 'in-memory-fallback' = 'in-memory-fallback';

    try {
      await this.db.execute(sql`SELECT 1`);
      dbStatus = 'connected';
    } catch {
      dbStatus = 'in-memory-fallback';
    }

    return {
      status: 'ok',
      database: dbStatus,
      serverTime: this.clock.now().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
