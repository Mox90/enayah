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
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import {
  appointmentTypeEnum,
  assignmentReasonEnum,
  contractStatusEnum,
  contractTypeEnum,
  employmentStatusEnum,
  employmentTypeEnum,
  genderEnum,
  movementTypeEnum,
  staffCategoryEnum,
  workforceCategoryEnum,
} from './enums'
import { relations, sql } from 'drizzle-orm'
import { countries } from './countries'
import { departments, jobGrades, positions } from './org'
import { files } from './credentials'

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeNumber: varchar('employee_number', { length: 10 })
      .notNull()
      .unique(),
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
    avatarFileId: uuid('avatar_file_id').references(() => files.id, {
      onDelete: 'set null',
    }),
    countryId: uuid('country_id').references(() => countries.id, {
      onDelete: 'restrict',
    }),
    ...baseColumns,
  },
  (table) => [
    index('idx_employees_avatar_file_id').on(table.avatarFileId),

    index('idx_employees_country_id').on(table.countryId),
  ],
)

export const employments = pgTable(
  'employments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),

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
  // (table) => ({
  //   employeeIdx: index('idx_employments_employee_id').on(table.employeeId),
  // }),
  (table) => [
    index('idx_employments_employee_id').on(table.employeeId),
    index('idx_employments_hire_date_active')
      .on(table.hireDate)
      .where(sql`${table.isDeleted} = false`),

    index('idx_employments_status_employee')
      .on(table.status, table.employeeId)
      .where(sql`${table.isDeleted} = false`),
  ],
)
//CREATE INDEX idx_employments_employee_id ON employments(employee_id);

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id, {
        onDelete: 'cascade',
      }),
    //positionItemId: uuid('position_item_id').references(() => positionItems.id),
    actualDepartmentId: uuid('actual_department_id').references(
      () => departments.id,
    ),
    actualPositionId: uuid('actual_position_id').references(() => positions.id),
    managerId: uuid('manager_id').references(() => employees.id),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    appointmentType: appointmentTypeEnum('appointment_type')
      .default('primary')
      .notNull(),
    remarks: text('remarks'),
    assignmentReason: assignmentReasonEnum('assignment_reason'), //Organizational Restructuring, Temporary Coverage, Promotion, Management Decision, Acting Capacity, Rotation, Service Need
    // status: varchar('status', { length: 20 }).$type<
    //   'active' | 'ended' | 'cancelled'
    // >(),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
    ...baseColumns,
  },
  (table) => ({
    employmentIdx: index('idx_appointments_employment').on(table.employmentId),
    validDateRange: check(
      'chk_appointments_valid_date_range',
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  }),
)

export const contracts = pgTable(
  'contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id),
    contractNumber: varchar('contract_number', {
      length: 50,
    })
      .unique() // must be deterministic ex: 2026-000001, 2026-000002
      .notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    contractType: contractTypeEnum('contract_type')
      .default('initial') // initial | renewal | amendment
      .notNull(),
    status: contractStatusEnum('status').default('draft').notNull(),
    signedDate: date('signed_date'),
    documentPath: text('document_path'),
    notes: text('notes'),
    ...baseColumns,
  },
  (table) => [
    index('idx_contracts_employment_id').on(table.employmentId),

    index('idx_contracts_status_end_date')
      .on(table.status, table.endDate)
      .where(sql`${table.isDeleted} = false`),

    check(
      'chk_contracts_valid_date_range',
      sql`
      ${table.endDate} IS NULL
      OR ${table.endDate} >= ${table.startDate}
    `,
    ),
  ],
)

export const contractMovements = pgTable(
  'contract_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .notNull()
      .references(() => contracts.id, {
        onDelete: 'cascade',
      }),
    positionItemId: uuid('position_item_id')
      .references(() => positionItems.id, { onDelete: 'restrict' })
      .notNull(), // WHERE they are budgeted (PCN) or what PCN funds the employee
    officialDepartmentId: uuid('official_department_id')
      .references(() => departments.id)
      .notNull(), // point to the legal department of an employee
    officialPositionId: uuid('official_position_id')
      .references(() => positions.id)
      .notNull(), // point to the legal role/position of an employee

    startDate: date('start_date').notNull(),
    endDate: date('end_date'),

    sequenceNumber: integer('sequence_number').default(1).notNull(),
    movementType: movementTypeEnum('movement_type')
      .default('initial')
      .notNull(),
    remarks: text('remarks'),

    ...baseColumns,
  },
  (table) => [
    index('idx_contract_movements_contract_id').on(table.contractId),

    index('idx_contract_movements_type_start_date')
      .on(table.movementType, table.startDate)
      .where(sql`${table.isDeleted} = false`),

    unique('uq_contract_sequence').on(table.contractId, table.sequenceNumber),

    check(
      'chk_job_assignments_valid_date_range',
      sql`
      ${table.endDate} IS NULL
      OR ${table.endDate} >= ${table.startDate}
    `,
    ),

    check('sequence_number_whole_number', sql`${table.sequenceNumber} >= 1`),
  ],
)

export const compensations = pgTable(
  'compensations',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    contractMovementId: uuid('contract_movement_id')
      .notNull()
      .references(() => contractMovements.id)
      .unique(),
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
  },
  (table) => ({
    contractMovementIdx: index('idx_compensations_contract_movement').on(
      table.contractMovementId,
    ),
  }),
)

export const compensationAllowances = pgTable('compensation_allowances', {
  id: uuid('id').defaultRandom().primaryKey(),
  compensationId: uuid('compensation_id')
    .notNull()
    .references(() => compensations.id),
  type: varchar('type', { length: 50 }).notNull(),
  amount: numeric('amount').notNull(),
})

export const positionItems = pgTable(
  'position_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    oldItemNumber: varchar('old_item_number', { length: 50 }), // to store the original item number from the import file for reference
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
  },
  (table) => [
    index('idx_position_items_status')
      .on(table.status)
      .where(sql`${table.isDeleted} = false`),
  ],
)

export const employeesRelations = relations(employees, ({ one, many }) => ({
  nationality: one(countries, {
    fields: [employees.countryId],
    references: [countries.id],
  }),
  employments: many(employments),
  //managers: many(contractMovements),
}))

export const employmentsRelations = relations(employments, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employments.employeeId],
    references: [employees.id],
  }),
  contracts: many(contracts),
  appointments: many(appointments),
}))

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  employment: one(employments, {
    fields: [appointments.employmentId],
    references: [employments.id],
  }),

  department: one(departments, {
    fields: [appointments.actualDepartmentId],
    references: [departments.id],
  }),

  position: one(positions, {
    fields: [appointments.actualPositionId],
    references: [positions.id],
  }),

  manager: one(employees, {
    fields: [appointments.managerId],
    references: [employees.id],
  }),

  // positionItem: one(positionItems, {
  //   fields: [appointments.positionItemId],
  //   references: [positionItems.id],
  // }),
}))

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  employment: one(employments, {
    fields: [contracts.employmentId],
    references: [employments.id],
  }),

  movements: many(contractMovements),
}))

export const contractMovementsRelations = relations(
  contractMovements,
  ({ one, many }) => ({
    contract: one(contracts, {
      fields: [contractMovements.contractId],
      references: [contracts.id],
    }),

    positionItem: one(positionItems, {
      fields: [contractMovements.positionItemId],
      references: [positionItems.id],
    }),

    department: one(departments, {
      fields: [contractMovements.officialDepartmentId],
      references: [departments.id],
    }),

    position: one(positions, {
      fields: [contractMovements.officialPositionId],
      references: [positions.id],
    }),

    compensations: many(compensations),
  }),
)

export const positionItemsRelations = relations(
  positionItems,
  ({ one, many }) => ({
    department: one(departments, {
      fields: [positionItems.departmentId],
      references: [departments.id],
    }),

    position: one(positions, {
      fields: [positionItems.positionId],
      references: [positions.id],
    }),

    jobGrade: one(jobGrades, {
      fields: [positionItems.jobGradeId],
      references: [jobGrades.id],
    }),

    contractMovements: many(contractMovements),
    //appointments: many(appointments),
  }),
)

export const compensationsRelations = relations(
  compensations,
  ({ one, many }) => ({
    contractMovement: one(contractMovements, {
      fields: [compensations.contractMovementId],
      references: [contractMovements.id],
    }),

    allowances: many(compensationAllowances),
  }),
)

export const compensationAllowancesRelations = relations(
  compensationAllowances,
  ({ one }) => ({
    compensation: one(compensations, {
      fields: [compensationAllowances.compensationId],
      references: [compensations.id],
    }),
  }),
)
