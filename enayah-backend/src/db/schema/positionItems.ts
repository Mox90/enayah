import { pgTable, numeric, uuid, varchar, integer } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { departments, positions, jobGrades } from './org'
import { workforceCategoryEnum } from './enums'

export const positionItems = pgTable('position_items', {
  id: uuid('id').defaultRandom().primaryKey(),

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
})
