import { pgTable, uuid, integer, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { accounts } from './accounts';

export const rounds = pgTable('rounds', {
  id: uuid('round_id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  plannedSeconds: integer('planned_seconds').notNull(),
  breakAfterSeconds: integer('break_after_seconds').notNull(),
  breakLengthSeconds: integer('break_length_seconds').notNull(),
  phase: varchar('phase', { length: 30 }).notNull(), // 'focus_before_break' | 'awaiting_decision' | 'focus_after_break' | 'closed'
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  breakStartedAt: timestamp('break_started_at', { withTimezone: true }),
  resumedAt: timestamp('resumed_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  outcome: varchar('outcome', { length: 20 }), // 'abandoned' | 'half' | 'full'
}, (table) => [
  uniqueIndex('unique_open_round_per_account')
    .on(table.accountId)
    .where(sql`phase != 'closed'`),
]);

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;
