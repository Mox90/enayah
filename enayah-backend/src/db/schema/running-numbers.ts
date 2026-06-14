// src/db/schema/running-numbers.ts

import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const runningNumbers = pgTable('running_numbers', {
  code: varchar('code', { length: 50 }).primaryKey(),
  currentValue: integer('current_value').default(0).notNull(),
  ...baseColumns,
})
