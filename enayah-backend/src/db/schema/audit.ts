import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),

  resource: varchar('resource', { length: 100 }),
  resourceId: varchar('resource_id', { length: 100 }),

  metadata: jsonb('metadata'),

  ip: varchar('ip', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
