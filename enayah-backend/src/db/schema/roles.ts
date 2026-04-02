import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { baseColumns } from './base'

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g. admin, doctor
  description: varchar('description', { length: 255 }),
  ...baseColumns,
})
