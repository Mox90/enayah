import {
  bigint,
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns, verificationColumns } from './base'
import { degreeTypeEnum, licenseStatusEnum, lifeSupportTypeEnum } from './enums'
import { employees } from './hr'
import { countries } from './countries'

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  storagePath: varchar('storage_path', { length: 500 }).notNull(),
  checksum: varchar('checksum', { length: 255 }),
  ...baseColumns,
})

export const employeeDegrees = pgTable('employee_degrees', {
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
  documentFileId: uuid('document_file_id').references(() => files.id),
  ...verificationColumns,
  ...baseColumns,
})

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

export const employeeLicenses = pgTable('employee_licenses', {
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
})

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
