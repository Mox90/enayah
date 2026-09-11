import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { relations, sql } from 'drizzle-orm'
import { userRoles } from './userRoles'
import { positionItems } from './hr'
import { workforceCategoryEnum } from './enums'

export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    nameEn: varchar('name_en', { length: 255 }).notNull(),
    nameAr: varchar('name_ar', { length: 255 }).notNull(),
    logo: varchar('logo', { length: 255 }),
    parentDepartmentId: uuid('parent_department_id').references(
      (): any => departments.id,
      { onDelete: 'restrict' },
    ),
    ...baseColumns,
  },
  (table) => ({
    parentDeptIdx: index('idx_departments_parent_department_id').on(
      table.parentDepartmentId,
    ),
    nameIdx: index('idx_departments_name_en_ar').on(table.nameEn, table.nameAr),
  }),
)

export const jobGrades = pgTable(
  'job_grades',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),

    minSalary: numeric('min_salary'),
    maxSalary: numeric('max_salary'),
    ...baseColumns,
  },
  (table) => ({
    nameUnique: uniqueIndex('uq_job_grades_name').on(table.name),
  }),
)

// export const positions = pgTable(
//   'positions',
//   {
//     id: uuid('id').defaultRandom().primaryKey(),
//     titleEn: varchar('title_en', { length: 150 }).notNull(),
//     titleAr: varchar('title_ar', { length: 150 }),

//     gradeId: uuid('grade_id').references(() => jobGrades.id),
//     ...baseColumns,
//   },
//   (table) => ({
//     titleIdx: index('idx_positions_title_en_ar').on(
//       table.titleEn,
//       table.titleAr,
//     ),
//   }),
// )

export const positions = pgTable(
  'positions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    titleEn: varchar('title_en', { length: 150 }).notNull(),
    titleAr: varchar('title_ar', { length: 150 }),

    gradeId: uuid('grade_id').references(() => jobGrades.id),

    /*
     * Default workforce classification of this legal job position.
     *
     * Used directly when an employee has no PCN.
     */
    workforceCategory: workforceCategoryEnum('workforce_category'), //.notNull(),

    /*
     * Numeric reporting/category code corresponding to workforceCategory:
     *
     * physician        -> 1000
     * nurse            -> 2000
     * allied_health    -> 3000
     * administrative  -> 4000
     * support_service -> 5000
     */
    categoryCode: integer('category_code'), //.notNull(),

    ...baseColumns,
  },
  (table) => [
    index('idx_positions_title_en_ar').on(table.titleEn, table.titleAr),
    index('idx_positions_workforce_category').on(table.workforceCategory),
    index('idx_positions_category_code').on(table.categoryCode),
    check(
      'chk_positions_workforce_category_code',
      sql`
        (
          ${table.workforceCategory} = 'physician'
          AND ${table.categoryCode} = 1000
        )
        OR
        (
          ${table.workforceCategory} = 'nurse'
          AND ${table.categoryCode} = 2000
        )
        OR
        (
          ${table.workforceCategory} = 'allied_health'
          AND ${table.categoryCode} = 3000
        )
        OR
        (
          ${table.workforceCategory} = 'administrative'
          AND ${table.categoryCode} = 4000
        )
        OR
        (
          ${table.workforceCategory} = 'support_service'
          AND ${table.categoryCode} = 5000
        )
      `,
    ),
  ],
)

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: 'department_hierarchy',
  }),

  childDepartments: many(departments, {
    relationName: 'department_hierarchy',
  }),

  userRoles: many(userRoles),

  positionItems: many(positionItems),
}))
