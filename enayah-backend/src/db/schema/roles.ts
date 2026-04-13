import {
  boolean,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { positions } from './org'

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g. admin, doctor
  description: varchar('description', { length: 255 }),

  isSystem: boolean('is_system').default(false).notNull(), //prevent deletion
  ...baseColumns,
})

export const positionRoles = pgTable(
  'position_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    positionId: uuid('position_id')
      .notNull()
      .references(() => positions.id, { onDelete: 'cascade' }),

    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    unique: uniqueIndex('position_role_unique').on(
      table.positionId,
      table.roleId,
    ),
  }),
)

export const roleLevels = pgTable('role_levels', {
  id: uuid('id').defaultRandom().primaryKey(),

  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),

  level: integer('level').notNull(), // 1 = highest (Director)
})
