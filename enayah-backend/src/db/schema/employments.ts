import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core'
import { employees } from './employees'
import { baseColumns } from './base'

export const employments = pgTable('employments', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),

  hireDate: timestamp('hire_date').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  employmentType: varchar('employment_type', { length: 50 }), // full-time, contract
  status: varchar('status', { length: 30 }).notNull(), // active, terminated

  causeOfLeaving: varchar('cause_of_leaving', { length: 255 }),

  ...baseColumns,
})
