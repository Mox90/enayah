import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id').notNull(),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),

    userAgent: varchar('user_agent', { length: 255 }),
    ip: varchar('ip', { length: 45 }),

    isRevoked: boolean('is_revoked').default(false),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // ✅ UNIQUE index (for security)
    refreshTokenHashUnique: uniqueIndex('sessions_refresh_token_hash_uq').on(
      table.refreshTokenHash,
    ),

    // ✅ Normal index (for fast queries)
    userIdIndex: index('sessions_user_id_idx').on(table.userId),
  }),
)
