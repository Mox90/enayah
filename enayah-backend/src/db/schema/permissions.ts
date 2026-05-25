import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { relations } from 'drizzle-orm'
import { rolePermissions } from './rolePermissions'

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  ...baseColumns,
  // examples:
  // create.employee
  // view.employee
  // update.employee
  // delete.employee
})

export const permissionsRelations = relations(
  permissions,

  ({ many }) => ({
    rolePermissions: many(rolePermissions),
  }),
)

/*
Naming convention:
employee.create
employee.view
employee.update
employee.delete
*/
