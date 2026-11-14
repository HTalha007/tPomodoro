import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';
export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export const databaseProviders: Provider[] = [
  {
    provide: DRIZZLE_PROVIDER,
    useFactory: () => {
      const connectionString =
        process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tpomodoro';
      const pgFn = typeof postgres === 'function' ? postgres : (postgres as any).default;
      const client = pgFn(connectionString);
      return drizzle(client, { schema });
    },
  },
];
