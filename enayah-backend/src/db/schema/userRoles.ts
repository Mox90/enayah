import {
  pgTable,
  uuid,
  primaryKey,
  boolean,
  varchar,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { roles } from './roles'
import { departments } from './org'
import { sql } from 'drizzle-orm'

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'cascade',
    }),

    scope: varchar('scope', { length: 50 }).default('hospital'),
    // hospital | department

    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => ({
    //pk: primaryKey({ columns: [table.userId, table.roleId] }),
    idx: index('user_roles_user_idx').on(table.userId),

    /*uniqueAssignment: uniqueIndex('user_role_unique').on(
      table.userId,
      table.roleId,
      table.departmentId,
    ),*/
    // ✅ WITH department
    userRoleUnique: uniqueIndex('user_role_unique')
      .on(table.userId, table.roleId, table.departmentId)
      .where(sql`${table.departmentId} IS NOT NULL`),

    // ✅ WITHOUT department
    userRoleUniqueNoDept: uniqueIndex('user_role_unique_no_dept')
      .on(table.userId, table.roleId)
      .where(sql`${table.departmentId} IS NULL`),
  }),
)
