import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const rooms = pgTable('rooms', {
  id: uuid('room_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  hostAccountId: uuid('host_account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
