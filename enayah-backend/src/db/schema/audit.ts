import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  text,
} from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),

  resource: varchar('resource', { length: 100 }),
  resourceId: varchar('resource_id', { length: 100 }),

  metadata: jsonb('metadata'),

  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
