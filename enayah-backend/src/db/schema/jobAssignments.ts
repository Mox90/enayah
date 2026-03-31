import { pgTable, uuid, timestamp, boolean } from 'drizzle-orm/pg-core'
import { employments } from './employments'
import { departments, positions } from './org'
import { employees } from './employees'
import { baseColumns } from './base'

export const jobAssignments = pgTable('job_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),

  employmentId: uuid('employment_id')
    .notNull()
    .references(() => employments.id, { onDelete: 'cascade' }),

  departmentId: uuid('department_id').references(() => departments.id),
  positionId: uuid('position_id').references(() => positions.id),

  managerId: uuid('manager_id').references(() => employees.id),

  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  isPrimary: boolean('is_primary').default(true),

  ...baseColumns,
})
