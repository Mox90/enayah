import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { users } from './users'
import { employees } from './hr'
import { files } from './credentials'
import {
  credentialVerificationActionEnum,
  credentialVerificationCredentialTypeEnum,
} from './enums'

/*
 * Immutable audit event.
 *
 * The current verification state remains on the individual credential table:
 *
 * - isVerified
 * - verifiedAt
 * - verifiedBy
 * - verificationRemarks
 *
 * This table preserves every verification and revocation event.
 */
export const credentialVerificationEvents = pgTable(
  'credential_verification_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'restrict',
      }),

    credentialType:
      credentialVerificationCredentialTypeEnum('credential_type').notNull(),

    /*
     * This is intentionally polymorphic, so it cannot have one database
     * foreign key. The service validates it against the configured
     * credential repository before inserting the event.
     */
    credentialId: uuid('credential_id').notNull(),

    action: credentialVerificationActionEnum('action').notNull(),

    remarks: text('remarks'),

    evidenceFileId: uuid('evidence_file_id').references(() => files.id, {
      onDelete: 'restrict',
    }),

    performedByUserId: uuid('performed_by_user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'restrict',
      }),

    performedAt: timestamp('performed_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('credential_verification_events_employee_idx').on(table.employeeId),

    index('credential_verification_events_credential_idx').on(
      table.credentialType,
      table.credentialId,
    ),

    index('credential_verification_events_performed_at_idx').on(
      table.performedAt,
    ),

    /*
     * PostgreSQL permits multiple NULL values in a unique index.
     * A non-null evidence file can belong to only one event.
     */
    uniqueIndex('credential_verification_events_evidence_file_uidx').on(
      table.evidenceFileId,
    ),
  ],
)

export type CredentialVerificationCredentialType =
  (typeof credentialVerificationCredentialTypeEnum.enumValues)[number]

export type CredentialVerificationAction =
  (typeof credentialVerificationActionEnum.enumValues)[number]

export type CredentialVerificationEvent =
  typeof credentialVerificationEvents.$inferSelect

export type NewCredentialVerificationEvent =
  typeof credentialVerificationEvents.$inferInsert
