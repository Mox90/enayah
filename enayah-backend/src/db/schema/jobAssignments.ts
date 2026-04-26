import {
  pgTable,
  uuid,
  timestamp,
  boolean,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { employments } from './employments'
import { departments, positions } from './org'
import { employees } from './employees'
import { baseColumns } from './base'
import { sql } from 'drizzle-orm'

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

//CREATE INDEX idx_job_assignments_employment_id ON job_assignments(employment_id);
