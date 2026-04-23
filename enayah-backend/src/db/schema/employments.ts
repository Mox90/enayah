import { date, index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { employees } from './employees'
import { baseColumns } from './base'
import {
  employmentStatusEnum,
  employmentTypeEnum,
  staffCategoryEnum,
} from './enums'
import { positionItems } from './positionItems'

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
    ), // WHERE they are budgeted (PCN)

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
