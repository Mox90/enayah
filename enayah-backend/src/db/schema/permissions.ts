import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
})

/*
Naming convention:
employee:create
employee:view
employee:update
employee:delete
*/
