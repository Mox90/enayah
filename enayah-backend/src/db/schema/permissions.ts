import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  ...baseColumns,
  // examples:
  // create:employee
  // view:employee
  // update:employee
  // delete:employee
})

/*
Naming convention:
employee:create
employee:view
employee:update
employee:delete
*/
