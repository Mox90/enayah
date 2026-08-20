import {
  AnyPgColumn,
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
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import {
  appointmentTypeEnum,
  assignmentReasonEnum,
  contractDocumentTypeEnum,
  contractStatusEnum,
  contractTypeEnum,
  employmentSeparationStatusEnum,
  employmentSeparationTypeEnum,
  employmentStatusEnum,
  employmentTypeEnum,
  genderEnum,
  movementActionTypeEnum,
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
    avatarFileId: uuid('avatar_file_id').references(
      (): AnyPgColumn => files.id,
      {
        onDelete: 'set null',
      },
    ),
    countryId: uuid('country_id').references(() => countries.id, {
      onDelete: 'restrict',
    }),
    ...baseColumns,
  },
  (table) => [
    uniqueIndex('uq_employees_avatar_file_id').on(table.avatarFileId),

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
    endDate: date('end_date'), //actual employment cessation date
    employmentType: employmentTypeEnum('employment_type'), // full-time, part-time, locum //HOW they work
    staffCategory: staffCategoryEnum('staff_category')
      .default('contractual')
      .notNull(), //WHO they are
    status: employmentStatusEnum('employment_status')
      .default('active')
      .notNull(), // active, terminated
    //causeOfLeaving: varchar('cause_of_leaving', { length: 255 }),
    ...baseColumns,
  },
  (table) => [
    index('idx_employments_employee_id').on(table.employeeId),
    index('idx_employments_hire_date_active')
      .on(table.hireDate)
      .where(sql`${table.isDeleted} = false`),
    index('idx_employments_status_employee')
      .on(table.status, table.employeeId)
      .where(sql`${table.isDeleted} = false`),
    check(
      'chk_employments_valid_date_range',
      sql`
        ${table.endDate} IS NULL
        OR ${table.endDate} >= ${table.startDate}
      `,
    ),
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
    endDate: date('end_date').notNull(), // remains the agreed end of the contractual term
    contractType: contractTypeEnum('contract_type')
      .default('initial') // initial | renewal
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
    positionItemId: uuid('position_item_id').references(
      () => positionItems.id,
      { onDelete: 'restrict' },
    ),
    //.notNull(), // WHERE they are budgeted (PCN) or what PCN funds the employee
    officialDepartmentId: uuid('official_department_id')
      .references(() => departments.id)
      .notNull(), // point to the official legal department of an employee
    officialPositionId: uuid('official_position_id')
      .references(() => positions.id)
      .notNull(), // point to the offivial legal role/position of an employee

    startDate: date('start_date').notNull(),
    endDate: date('end_date'),

    sequenceNumber: integer('sequence_number').default(1).notNull(),
    movementType: movementTypeEnum('movement_type')
      //.default('initial')
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

export const contractMovementActions = pgTable(
  'contract_movement_actions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractMovementId: uuid('contract_movement_id')
      .notNull()
      .references(() => contractMovements.id, {
        onDelete: 'cascade',
      }),
    actionType: movementActionTypeEnum('action_type').notNull(),
    ...baseColumns,
  },

  (table) => [
    index('idx_contract_movement_actions_movement').on(
      table.contractMovementId,
    ),
    index('idx_contract_movement_actions_type').on(table.actionType),
    uniqueIndex('uq_contract_movement_action_active')
      .on(table.contractMovementId, table.actionType)
      .where(sql`${table.isDeleted} = false`),
  ],
)

export const employmentSeparations = pgTable(
  'employment_separations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id, {
        onDelete: 'cascade',
      }),
    separationType: employmentSeparationTypeEnum('separation_type').notNull(),
    status: employmentSeparationStatusEnum('status').default('draft').notNull(),
    noticeDate: date('notice_date'),
    effectiveDate: date('effective_date').notNull(),
    reason: text('reason'),
    remarks: text('remarks'),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
    ...baseColumns,
  },
  (table) => [
    index('idx_employment_separations_employment').on(table.employmentId),
    index('idx_employment_separations_status').on(table.status),
    index('idx_employment_separations_effective_date').on(table.effectiveDate),
    uniqueIndex('uq_employment_separation_open')
      .on(table.employmentId)
      .where(
        sql`
          ${table.isDeleted} = false
          AND ${table.status} IN (
            'draft',
            'pending_approval',
            'approved'
          )
        `,
      ),
  ],
)

export const contractDocuments = pgTable(
  'contract_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .notNull()
      .references(() => contracts.id, {
        onDelete: 'cascade',
      }),
    contractMovementId: uuid('contract_movement_id').references(
      () => contractMovements.id,
      {
        onDelete: 'set null',
      },
    ),
    fileId: uuid('file_id')
      .notNull()
      .references(() => files.id, {
        onDelete: 'restrict',
      }),
    documentType: contractDocumentTypeEnum('document_type').notNull(),
    versionNumber: integer('version_number').default(1).notNull(),
    effectiveDate: date('effective_date').notNull(),
    signedDate: date('signed_date'),
    acknowledgedAt: timestamp('acknowledged_at'),
    remarks: text('remarks'),
    ...baseColumns,
  },
  (table) => [
    index('idx_contract_documents_contract').on(table.contractId),

    unique('uq_contract_document_version').on(
      table.contractId,
      table.versionNumber,
    ),

    check('chk_contract_document_version', sql`${table.versionNumber} >= 1`),
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
  separations: many(employmentSeparations),
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

  documents: many(contractDocuments),
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

    actions: many(contractMovementActions),

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

export const contractMovementActionsRelations = relations(
  contractMovementActions,
  ({ one }) => ({
    movement: one(contractMovements, {
      fields: [contractMovementActions.contractMovementId],
      references: [contractMovements.id],
    }),
  }),
)

export const employmentSeparationsRelations = relations(
  employmentSeparations,
  ({ one }) => ({
    employment: one(employments, {
      fields: [employmentSeparations.employmentId],
      references: [employments.id],
    }),
  }),
)

export const contractDocumentsRelations = relations(
  contractDocuments,
  ({ one }) => ({
    contract: one(contracts, {
      fields: [contractDocuments.contractId],
      references: [contracts.id],
    }),

    movement: one(contractMovements, {
      fields: [contractDocuments.contractMovementId],
      references: [contractMovements.id],
    }),

    file: one(files, {
      fields: [contractDocuments.fileId],
      references: [files.id],
    }),
  }),
)
