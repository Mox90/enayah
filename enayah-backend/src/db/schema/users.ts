import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
  index,
  check,
  text,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { authProviderEnum } from './enums'
import { employees } from './employees'
import { sql } from 'drizzle-orm'
//import { roleEnum, authProviderEnum } from './enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // 🔐 Identity
    email: varchar('email', { length: 255 }).notNull(),
    username: varchar('username', { length: 100 }).notNull(),

    // 🔐 Authentication
    passwordHash: varchar('password_hash', { length: 255 }),
    authProvider: authProviderEnum('auth_provider').default('local').notNull(),

    // 👤 Authorization
    //   role: roleEnum('role').notNull(),

    // 🔒 Security
    isActive: boolean('is_active').default(true).notNull(),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockedUntil: timestamp('locked_until'),

    mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
    mfaSecret: varchar('mfa_secret', { length: 255 }),

    mfaSecretCipher: text('mfa_secret_cipher'),
    mfaSecretIv: varchar('mfa_secret_iv', { length: 24 }), // base64 IV
    mfaSecretTag: varchar('mfa_secret_tag', { length: 24 }), // base64 auth tag

    mfaEnabledAt: timestamp('mfa_enabled_at'),
    mfaDisabledAt: timestamp('mfa_disabled_at'),

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
      mfaConstraint: check(
        'users_mfa_enabled_requires_secret',
        sql`${table.mfaEnabled} = false OR ${table.mfaSecret} IS NOT NULL`,
      ),
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
