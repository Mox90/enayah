import {
  AnyPgColumn,
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns, verificationColumns } from './base'
import {
  degreeTypeEnum,
  employeeDocumentTypeEnum,
  fileCategoryEnum,
  fileVisibilityEnum,
  licenseStatusEnum,
  lifeSupportTypeEnum,
} from './enums'
import { employees } from './hr'
import { countries } from './countries'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'

/** Sample  */

/**
{
  "personal": {},
  "employment": {},
  "credentials": {
    "degrees": [],
    "boards": [],
    "fellowships": [],
    "memberships": [],
    "licenses": [],
    "lifeSupport": [],
    "malpracticeInsurance": []
  },

  "verification": {
    "primarySourceVerification": []
  },

  "occupationalHealth": {
    "medicalExaminations": [],
    "vaccinations": []
  },

  "training": [],
  "cpd": [],
  "documents": [],
  "leaveDocuments": []
}
 * 
 */

// export const files = pgTable('files', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   fileName: varchar('file_name', { length: 255 }).notNull(),
//   originalName: varchar('original_name', { length: 255 }).notNull(),
//   mimeType: varchar('mime_type', { length: 100 }).notNull(),
//   fileSize: bigint('file_size', { mode: 'number' }).notNull(),
//   storagePath: varchar('storage_path', { length: 500 }).notNull(),
//   checksum: varchar('checksum', { length: 255 }),
//   ...baseColumns,
// })

// export const files = pgTable(
//   'files',
//   {
//     id: uuid('id').defaultRandom().primaryKey(),
//     storedName: varchar('stored_name', {
//       length: 255,
//     }).notNull(),
//     originalName: varchar('original_name', {
//       length: 255,
//     }).notNull(),
//     mimeType: varchar('mime_type', {
//       length: 100,
//     }).notNull(),
//     fileSize: bigint('file_size', {
//       mode: 'number',
//     }).notNull(),
//     storageKey: varchar('storage_key', {
//       length: 500,
//     }).notNull(),
//     checksumSha256: varchar('checksum_sha256', {
//       length: 64,
//     }),
//     ...baseColumns,
//   },
//   (table) => [
//     uniqueIndex('uq_files_storage_key').on(table.storageKey),
//     index('idx_files_checksum_sha256').on(table.checksumSha256),
//     check(
//       'chk_files_file_size',
//       sql`
//         ${table.fileSize} > 0
//         AND ${table.fileSize} <= 2097152
//       `,
//     ),
//   ],
// )

export const files = pgTable(
  'files',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    storedName: varchar('stored_name', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    storageKey: varchar('storage_key', { length: 500 }).notNull(),
    checksumSha256: varchar('checksum_sha256', { length: 64 }),
    visibility: fileVisibilityEnum('visibility').notNull().default('private'),
    category: fileCategoryEnum('category').notNull().default('other'),
    uploadedByUserId: uuid('uploaded_by_user_id').references(
      (): AnyPgColumn => users.id,
      {
        onDelete: 'set null',
      },
    ),
    ...baseColumns,
  },
  (table) => [
    uniqueIndex('uq_files_storage_key').on(table.storageKey),
    index('idx_files_checksum_sha256').on(table.checksumSha256),
    index('idx_files_visibility').on(table.visibility),
    index('idx_files_category').on(table.category),
    index('idx_files_uploaded_by_user_id').on(table.uploadedByUserId),
    check(
      'chk_files_file_size',
      sql`
        ${table.fileSize} > 0
        AND ${table.fileSize} <= 2097152
      `,
    ),
  ],
)

export const employeeDegrees = pgTable(
  'employee_degrees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    degreeType: degreeTypeEnum('degree_type').notNull(),
    degreeName: varchar('degree_name', {
      length: 255,
    }).notNull(),
    major: varchar('major', { length: 255 }),
    institution: varchar('institution', { length: 255 }).notNull(),
    countryId: uuid('country_id').references(() => countries.id),
    graduationDate: date('graduation_date'),
    documentFileId: uuid('document_file_id').references(() => files.id, {
      onDelete: 'restrict',
    }),
    ...verificationColumns,
    ...baseColumns,
  },
  (table) => [
    uniqueIndex('uq_employee_degree_document_file_id').on(table.documentFileId),
  ],
)

export const employeeBoards = pgTable('employee_boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  boardName: varchar('board_name', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 255 }),
  issuingBody: varchar('issuing_body', { length: 255 }).notNull(),
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  isLifetime: boolean('is_lifetime').default(false).notNull(),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...verificationColumns,
  ...baseColumns,
})

export const employeeFellowships = pgTable('employee_fellowships', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  fellowshipName: varchar('fellowship_name', { length: 255 }).notNull(),
  abbreviation: varchar('abbreviation', { length: 50 }),
  issuingBody: varchar('issuing_body', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 255 }),
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...verificationColumns,
  ...baseColumns,
})

export const employeeMemberships = pgTable('employee_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  organization: varchar('organization', { length: 255 }).notNull(),
  membershipNumber: varchar('membership_number', { length: 100 }),
  membershipLevel: varchar('membership_level', { length: 100 }),
  startDate: date('start_date'),
  expiryDate: date('expiry_date'),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...verificationColumns,
  ...baseColumns,
})

export const employeeLicenses = pgTable(
  'employee_licenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    authority: varchar('authority', { length: 255 }).notNull(),
    licenseNumber: varchar('license_number', { length: 100 }).notNull(),
    profession: varchar('profession', { length: 255 }).notNull(),
    specialty: varchar('specialty', { length: 255 }),
    issueDate: date('issue_date'),
    expiryDate: date('expiry_date').notNull(),
    status: licenseStatusEnum('status').default('active').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...verificationColumns,
    ...baseColumns,
  },
  (table) => [
    index('idx_employee_licenses_expiry_date')
      .on(table.expiryDate)
      .where(sql`${table.isDeleted} = false`),
  ],
)

export const employeeLifeSupportCertifications = pgTable(
  'employee_life_support_certifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    type: lifeSupportTypeEnum('type').notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    certificateNumber: varchar('certificate_number', { length: 100 }),
    issueDate: date('issue_date'),
    expiryDate: date('expiry_date'),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...verificationColumns,
    ...baseColumns,
  },
)

export const employeeMalpracticeInsurance = pgTable(
  'employee_malpractice_insurance',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    insuranceCompany: varchar('insurance_company', { length: 255 }).notNull(),
    policyNumber: varchar('policy_number', { length: 100 }).notNull(),
    coverageAmount: numeric('coverage_amount', { precision: 15, scale: 2 }),
    startDate: date('start_date'),
    expiryDate: date('expiry_date'),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...verificationColumns,
    ...baseColumns,
  },
)

// Orientation
// Infection Control
// Fire Safety
// Quality & Patient Safety
// Hazardous Materials
export const trainingCategories = pgTable('training_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  //expiryDate: date('expiry_date'),
  ...baseColumns,
})

export const trainingCourses = pgTable('training_courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => trainingCategories.id),
  code: varchar('code', { length: 50 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  validityMonths: integer('validity_months'),
  isMandatory: boolean('is_mandatory').default(false).notNull(),
  ...baseColumns,
})

export const employeeTrainingRecords = pgTable('employee_training_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => trainingCourses.id),
  completionDate: date('completion_date').notNull(),
  expiryDate: date('expiry_date'),
  score: numeric('score', { precision: 5, scale: 2 }),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...baseColumns,
})

// Conference
// Workshop
// Seminar
// Research
// Publication
export const cpdCategories = pgTable('cpd_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  ...baseColumns,
})

export const employeeCpdRecords = pgTable('employee_cpd_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => cpdCategories.id),
  title: varchar('title', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }),
  hours: numeric('hours', { precision: 5, scale: 2 }),
  creditPoints: numeric('credit_points', { precision: 5, scale: 2 }),
  activityDate: date('activity_date'),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...baseColumns,
})

export const employeeTrainingRecordsRelations = relations(
  employeeTrainingRecords,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeTrainingRecords.employeeId],
      references: [employees.id],
    }),

    course: one(trainingCourses, {
      fields: [employeeTrainingRecords.courseId],
      references: [trainingCourses.id],
    }),
  }),
)

export const trainingCoursesRelations = relations(
  trainingCourses,
  ({ one, many }) => ({
    category: one(trainingCategories, {
      fields: [trainingCourses.categoryId],
      references: [trainingCategories.id],
    }),

    records: many(employeeTrainingRecords),
  }),
)

export const trainingCategoriesRelations = relations(
  trainingCategories,
  ({ many }) => ({
    courses: many(trainingCourses),
  }),
)

export const employeeCpdRecordsRelations = relations(
  employeeCpdRecords,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeCpdRecords.employeeId],
      references: [employees.id],
    }),

    category: one(cpdCategories, {
      fields: [employeeCpdRecords.categoryId],
      references: [cpdCategories.id],
    }),
  }),
)

export const cpdCategoriesRelations = relations(cpdCategories, ({ many }) => ({
  records: many(employeeCpdRecords),
}))

export const employeeDocuments = pgTable('employee_documents', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),

  documentType: employeeDocumentTypeEnum('document_type').notNull(),

  fileId: uuid('file_id')
    .notNull()
    .references(() => files.id),

  title: varchar('title', {
    length: 255,
  }),
  documentNumber: varchar('document_number', {
    length: 100,
  }),
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  remarks: varchar('remarks', {
    length: 1000,
  }),
  ...verificationColumns,
  ...baseColumns,
})

export const employeePrimarySourceVerifications = pgTable(
  'employee_primary_source_verifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'cascade',
      }),
    vendor: varchar('vendor', {
      length: 255,
    }).notNull(),
    verificationReferenceNumber: varchar('verification_reference_number', {
      length: 100,
    }),
    verificationDate: date('verification_date').notNull(),
    status: varchar('status', {
      length: 50,
    })
      .$type<'verified' | 'failed' | 'pending'>()
      .default('pending')
      .notNull(),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...verificationColumns,
    ...baseColumns,
  },
)

/*
Source:
Pre-employment Medical
Annual Medical
Fit To Work
Return To Work
*/
export const employeeMedicalExaminations = pgTable(
  'employee_medical_examinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'cascade',
      }),
    examinationType: varchar('examination_type', {
      length: 100,
    }).notNull(),
    examinationDate: date('examination_date').notNull(),
    result: varchar('result', {
      length: 100,
    }),
    facilityName: varchar('facility_name', {
      length: 255,
    }),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...verificationColumns,
    ...baseColumns,
  },
)

export const employeeVaccinations = pgTable('employee_vaccinations', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  vaccineName: varchar('vaccine_name', {
    length: 255,
  }).notNull(),
  doseNumber: integer('dose_number'),
  vaccinationDate: date('vaccination_date'),
  expiryDate: date('expiry_date'),
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...verificationColumns,
  ...baseColumns,
})

export const employeeDisciplinaryActions = pgTable(
  'employee_disciplinary_actions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    actionType: varchar('action_type', {
      length: 100,
    }).notNull(),
    actionDate: date('action_date').notNull(),
    description: varchar('description', {
      length: 1000,
    }),
    documentFileId: uuid('document_file_id').references(() => files.id),
    ...baseColumns,
  },
)
