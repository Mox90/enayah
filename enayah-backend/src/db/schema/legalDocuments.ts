import {
  pgTable,
  uuid,
  varchar,
  date,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { employments } from './hr'

export const legalDocuments = pgTable(
  'legal_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 50 }).notNull(),
    // iqama | passport | visa | scfhs_license | home_country_license | malpractice_insurance | BLS | ACLS | PALS | ATLS | STLS | ALSO | BLSO | other

    documentNumber: varchar('document_number', { length: 100 }),

    issueDate: date('issue_date'),
    expiryDate: date('expiry_date'),

    issuingAuthority: varchar('issuing_authority', { length: 255 }),

    status: varchar('status', { length: 20 }).default('active'),

    metadata: jsonb('metadata'), // 🔥 flexible fields

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => ({
    employmentIdx: index('idx_legal_docs_employment').on(table.employmentId),
  }),
)

export const legalDocumentFiles = pgTable('legal_document_files', {
  id: uuid('id').defaultRandom().primaryKey(),

  documentId: uuid('document_id')
    .notNull()
    .references(() => legalDocuments.id, { onDelete: 'cascade' }),

  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
})
