import { date, index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { employees } from './employees'
import { baseColumns } from './base'
import { employmentStatusEnum, employmentTypeEnum } from './enums'

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

    employmentType: employmentTypeEnum('employment_type'), // full-time, contract
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
