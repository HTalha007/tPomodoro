import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tpomodoro';
  console.log('Running migrations against database...');

  const pgFn = typeof postgres === 'function' ? postgres : (postgres as any).default;
  const migrationClient = pgFn(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  // In production (dist) or ts-node/tsx, resolve path to drizzle folder
  const migrationsFolder = path.resolve(__dirname, '../../../drizzle');
  await migrate(db, { migrationsFolder });

  console.log('Migrations applied successfully!');
  await migrationClient.end();
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
