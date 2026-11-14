import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const sessions = pgTable('sessions', {
  token: text('session_token').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_sessions_account_id').on(table.accountId),
]);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
