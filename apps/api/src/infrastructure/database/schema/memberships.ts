import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { accounts } from './accounts';
import { rooms } from './rooms';

export const memberships = pgTable('memberships', {
  id: uuid('membership_id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('unique_active_membership_per_account')
    .on(table.accountId)
    .where(sql`left_at IS NULL`),
  index('idx_memberships_room_active')
    .on(table.roomId)
    .where(sql`left_at IS NULL`),
]);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
