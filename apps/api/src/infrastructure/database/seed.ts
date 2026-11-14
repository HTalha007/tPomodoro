import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';

async function seed() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tpomodoro';

  console.log('Seeding database...');
  const pgFn = typeof postgres === 'function' ? postgres : (postgres as any).default;
  const client = pgFn(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  // 1. Create or get test users
  const user1Email = 'kerem@example.com';
  const user2Email = 'zeynep@example.com';

  let [user1] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.email, user1Email))
    .limit(1);

  if (!user1) {
    [user1] = await db
      .insert(schema.accounts)
      .values({
        id: crypto.randomUUID(),
        email: user1Email,
        passwordHash,
        timezone: 'Europe/Istanbul',
      })
      .returning();
    console.log(`Created test user: ${user1Email}`);
  }

  let [user2] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.email, user2Email))
    .limit(1);

  if (!user2) {
    [user2] = await db
      .insert(schema.accounts)
      .values({
        id: crypto.randomUUID(),
        email: user2Email,
        passwordHash,
        timezone: 'Europe/Istanbul',
      })
      .returning();
    console.log(`Created test user: ${user2Email}`);
  }

  // 2. Create sample room
  const existingRooms = await db.select().from(schema.rooms).limit(1);
  let room = existingRooms[0];

  if (!room) {
    const code = crypto.randomBytes(16).toString('hex');
    [room] = await db
      .insert(schema.rooms)
      .values({
        id: crypto.randomUUID(),
        code,
        hostAccountId: user1.id,
      })
      .returning();

    // Add memberships
    await db.insert(schema.memberships).values([
      {
        id: crypto.randomUUID(),
        roomId: room.id,
        accountId: user1.id,
      },
      {
        id: crypto.randomUUID(),
        roomId: room.id,
        accountId: user2.id,
      },
    ]);
    console.log(`Created sample study room with code: ${code}`);
  }

  console.log('Database seeding completed successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
