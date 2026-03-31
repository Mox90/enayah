import { pgTable, uuid, timestamp, numeric, varchar } from 'drizzle-orm/pg-core'
import { employments } from './employments'
import { baseColumns } from './base'

export const salaries = pgTable('salaries', {
  id: uuid('id').defaultRandom().primaryKey(),

  employmentId: uuid('employment_id')
    .notNull()
    .references(() => employments.id, { onDelete: 'cascade' }),

  basicSalary: numeric('basic_salary').notNull(),
  housingAllowance: numeric('housing_allowance'),
  transportAllowance: numeric('transport_allowance'),
  otherAllowance: numeric('other_allowance'),

  currency: varchar('currency', { length: 10 }).default('SAR'),

  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  ...baseColumns,
})
