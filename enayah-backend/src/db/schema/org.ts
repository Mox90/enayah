import { integer, numeric, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  logo: varchar('logo', { length: 255 }),
  parentDepartmentId: uuid('parent_department_id').references(
    (): any => departments.id,
    { onDelete: 'restrict' },
  ),
})

export const jobGrades = pgTable('job_grades', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),

  minSalary: numeric('min_salary'),
  maxSalary: numeric('max_salary'),
})

export const positions = pgTable('positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleEn: varchar('title_en', { length: 150 }).notNull(),
  titleAr: varchar('title_ar', { length: 150 }).notNull(),

  gradeId: uuid('grade_id').references(() => jobGrades.id),
})
