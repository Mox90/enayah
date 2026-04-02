import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { authProviderEnum } from './enums'
import { employees } from './employees'
//import { roleEnum, authProviderEnum } from './enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // 🔐 Identity
    email: varchar('email', { length: 255 }).notNull(),
    username: varchar('username', { length: 100 }),

    // 🔐 Authentication
    passwordHash: varchar('password_hash', { length: 255 }),
    authProvider: authProviderEnum('auth_provider').default('local').notNull(),

    // 👤 Authorization
    //   role: roleEnum('role').notNull(),

    // 🔒 Security
    isActive: boolean('is_active').default(true).notNull(),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockedUntil: timestamp('locked_until'),
    lastLoginAt: timestamp('last_login_at'),
    lastFailedLoginAt: timestamp('last_failed_login_at'),

    passwordChangedAt: timestamp('password_changed_at'),
    mustChangePassword: boolean('must_change_password')
      .default(false)
      .notNull(),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'restrict',
      }),

    ...baseColumns,
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('users_email_unique').on(table.email),
      usernameIdx: uniqueIndex('users_username_unique').on(table.username),
      employeeIdx: uniqueIndex('users_employee_unique').on(table.employeeId),
    }
  },
)

export const passwordHistory = pgTable(
  'password_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    passwordHash: varchar('password_hash', { length: 255 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('password_history_user_idx').on(table.userId), // ✅ CRITICAL
  }),
)
