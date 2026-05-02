import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import {
  employmentStatusEnum,
  employmentTypeEnum,
  genderEnum,
  staffCategoryEnum,
  workforceCategoryEnum,
} from './enums'
import { relations, sql } from 'drizzle-orm'
import { countries } from './countries'
import { departments, jobGrades, positions } from './org'

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeNumber: varchar('employee_number', { length: 10 }).notNull().unique(),
  firstNameEn: varchar('first_name_en', { length: 100 }).notNull(),
  secondNameEn: varchar('second_name_en', { length: 100 }),
  thirdNameEn: varchar('third_name_en', { length: 100 }),
  familyNameEn: varchar('family_name_en', { length: 100 }).notNull(),
  firstNameAr: varchar('first_name_ar', { length: 100 }).notNull(),
  secondNameAr: varchar('second_name_ar', { length: 100 }),
  thirdNameAr: varchar('third_name_ar', { length: 100 }),
  familyNameAr: varchar('family_name_ar', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  countryId: uuid('country_id').references((): any => countries.id, {
    onDelete: 'restrict',
  }),
  ...baseColumns,
})

export const employeesRelations = relations(employees, ({ one }) => ({
  nationality: one(countries, {
    fields: [employees.countryId],
    references: [countries.id],
  }),
}))

export const employments = pgTable(
  'employments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    //itemNumber: varchar('item_number', { length: 50 }),
    positionItemId: uuid('position_item_id').references(
      () => positionItems.id,
      { onDelete: 'restrict' },
    ), // WHERE they are budgeted (PCN) or what PCN funds the employee

    hireDate: date('hire_date').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),

    employmentType: employmentTypeEnum('employment_type'), // full-time, part-time, locum //HOW they work
    staffCategory: staffCategoryEnum('staff_category')
      .default('contractual')
      .notNull(), //WHO they are

    status: employmentStatusEnum('employment_status')
      .default('active')
      .notNull(), // active, terminated

    causeOfLeaving: varchar('cause_of_leaving', { length: 255 }),

    ...baseColumns,
  },
  (table) => ({
    employeeIdx: index('idx_employments_employee_id').on(table.employeeId),
  }),
)
//CREATE INDEX idx_employments_employee_id ON employments(employee_id);

export const contracts = pgTable(
  'contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    contractType: varchar('contract_type', { length: 50 }) // initial | renewal | amendment
      .notNull(),
    status: varchar('status', { length: 20 }).default('active'),
    notes: text('notes'),
    ...baseColumns,
  },
  (table) => ({
    employeeIdx: index('idx_contracts_employment_id').on(table.employmentId),
  }),
)

export const jobAssignments = pgTable(
  'job_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id, { onDelete: 'cascade' }),

    departmentId: uuid('department_id').references(() => departments.id), // point to the real/actual department of an employee
    positionId: uuid('position_id').references(() => positions.id), // point to the real/actual role/position of an employee

    managerId: uuid('manager_id').references(() => employees.id, {
      onDelete: 'restrict',
    }),

    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),

    isPrimary: boolean('is_primary').default(true),

    ...baseColumns,
  },

  (table) => ({
    employmentIdx: index('idx_job_assignments_employment_id').on(
      table.employmentId,
    ),
    validDateRange: check(
      'chk_job_assignments_valid_date_range',
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  }),
)

export const compensations = pgTable('compensations', {
  id: uuid('id').defaultRandom().primaryKey(),

  employmentId: uuid('employment_id')
    .notNull()
    .references(() => employments.id),
  effectiveDate: date('effective_date').notNull(),

  baseSalary: numeric('base_salary').notNull(),
  status: varchar('status', { length: 20 }) // draft, approved, applied
    .$type<'draft' | 'approved' | 'applied'>()
    .default('draft')
    .notNull(),
  reason: varchar('reason', { length: 50 }), // increment, promotion

  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),

  createdAt: timestamp('created_at').defaultNow(),
})

export const compensationAllowances = pgTable('compensation_allowances', {
  id: uuid('id').defaultRandom().primaryKey(),
  compensationId: uuid('compensation_id')
    .notNull()
    .references(() => compensations.id),
  type: varchar('type', { length: 50 }).notNull(),
  amount: numeric('amount').notNull(),
})

export const positionItems = pgTable('position_items', {
  id: uuid('id').defaultRandom().primaryKey(),

  itemNumber: varchar('item_number', { length: 50 }).notNull().unique(),

  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id),

  positionId: uuid('position_id')
    .notNull()
    .references(() => positions.id),

  jobGradeId: uuid('job_grade_id').references(() => jobGrades.id),

  workforceCategory: workforceCategoryEnum('workforce_category'), //Physician, Nurse, Allied Health, Administrative, Support Service // workforce classification
  categoryCode: integer('category_code'), // 1000, 2000, 3000, 4000, 5000 // workforce classification

  minSalary: numeric('min_salary'),
  maxSalary: numeric('max_salary'),

  status: varchar('status', { length: 20 }).default('vacant').notNull(), // vacant, reserved, filled, frozen

  ...baseColumns,
})

//CREATE INDEX idx_job_assignments_employment_id ON job_assignments(employment_id);
