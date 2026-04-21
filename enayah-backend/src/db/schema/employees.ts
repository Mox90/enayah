import { date, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { countries } from './countries'
import { genderEnum } from './enums'
import { relations } from 'drizzle-orm'

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeNumber: varchar('employee_number', { length: 10 }).notNull().unique(),
  firstNameEn: varchar('first_name_en', { length: 100 }).notNull(),
  secondNameEn: varchar('second_name_en', { length: 100 }),
  thirdNameEn: varchar('third_name_en', { length: 100 }),
  familyNameEn: varchar('family_name_en', { length: 100 }).notNull(),
  firstNameAr: varchar('first_name_ar', { length: 100 }).notNull(),
  secondNameAr: varchar('second_name_ar', { length: 100 }),
  thirdNameAr: varchar('third_name_ar', { length: 100 }),
  familyNameAr: varchar('family_name_ar', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  countryId: uuid('country_id').references((): any => countries.id, {
    onDelete: 'restrict',
  }),
  ...baseColumns,
})

export const employeesRelations = relations(employees, ({ one }) => ({
  nationality: one(countries, {
    fields: [employees.countryId],
    references: [countries.id],
  }),
}))
