import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  varchar,
  index,
} from 'drizzle-orm/pg-core'
import { employments } from './employments'
import { baseColumns } from './base'

export const salaries = pgTable(
  'salaries',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    employmentId: uuid('employment_id')
      .notNull()
      .references(() => employments.id, { onDelete: 'cascade' }),

    basicSalary: numeric('basic_salary', { precision: 12, scale: 2 }).notNull(),
    housingAllowance: numeric('housing_allowance', { precision: 12, scale: 2 }),
    transportAllowance: numeric('transport_allowance', {
      precision: 12,
      scale: 2,
    }),
    otherAllowance: numeric('other_allowance', { precision: 12, scale: 2 }),

    currency: varchar('currency', { length: 10 }).notNull().default('SAR'),

    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),

    ...baseColumns,
  },
  (table) => ({
    employmentIdx: index('idx_salaries_employment_id').on(table.employmentId),
  }),
)
//CREATE INDEX idx_salaries_employment_id ON salaries(employment_id);
