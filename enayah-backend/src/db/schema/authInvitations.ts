import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { employees } from './hr'

export const authInvitations = pgTable('auth_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),

  token: varchar('token', {
    length: 255,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  }).notNull(),

  isUsed: boolean('is_used').default(false).notNull(),

  expiresAt: timestamp('expires_at').notNull(),

  usedAt: timestamp('used_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})
