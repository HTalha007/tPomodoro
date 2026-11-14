import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: uuid('account_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Europe/Istanbul'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
