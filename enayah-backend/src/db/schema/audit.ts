// src/db/schema/auditLogs.ts

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  text,
  boolean,
  index,
} from 'drizzle-orm/pg-core'

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id'),

    action: varchar('action', { length: 100 }).notNull(),

    resource: varchar('resource', { length: 100 }),
    resourceId: varchar('resource_id', { length: 100 }),

    // 🔥 SNAPSHOTS
    before: jsonb('before'),
    after: jsonb('after'),

    metadata: jsonb('metadata'),

    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),

    // 🔥 NEW (COMPLIANCE)
    success: boolean('success'),
    requestId: varchar('request_id', { length: 100 }),
    module: varchar('module', { length: 50 }),

    // 🔥 REVIEW WORKFLOW
    reviewed: boolean('reviewed').default(false),
    reviewedBy: uuid('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),

    // 🔒 INTEGRITY
    hash: text('hash'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index('idx_audit_user').on(table.userId),
    resourceIdx: index('idx_audit_resource').on(table.resource),
    createdAtIdx: index('idx_audit_created_at').on(table.createdAt),
  }),
)
