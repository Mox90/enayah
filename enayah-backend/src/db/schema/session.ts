import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id').notNull(),

  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),

  userAgent: varchar('user_agent', { length: 255 }),
  ip: varchar('ip', { length: 45 }),

  isRevoked: boolean('is_revoked').default(false),

  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
