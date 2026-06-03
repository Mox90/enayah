import { boolean, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const baseColumns = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by'),

  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by'),

  version: integer('version').default(1).notNull(),
}

export const verificationColumns = {
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by'),
  verificationRemarks: text('verification_remarks'),
}
