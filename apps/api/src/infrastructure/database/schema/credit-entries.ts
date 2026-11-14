import { pgTable, uuid, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { rounds } from './rounds';
import { rooms } from './rooms';

export const creditEntries = pgTable('credit_entries', {
  id: uuid('entry_id').primaryKey().defaultRandom(),
  roundId: uuid('round_id').notNull().unique().references(() => rounds.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  creditedSeconds: integer('credited_seconds').notNull(),
  outcome: varchar('outcome', { length: 20 }).notNull(), // 'abandoned' | 'half' | 'full'
  closedAt: timestamp('closed_at', { withTimezone: true }).notNull(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_credit_entries_account_closed').on(table.accountId, table.closedAt),
  index('idx_credit_entries_room').on(table.roomId),
]);

export type CreditEntry = typeof creditEntries.$inferSelect;
export type NewCreditEntry = typeof creditEntries.$inferInsert;
