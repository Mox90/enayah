import { and, eq, exists } from 'drizzle-orm'
import { db, userRoles } from '../../../../db'
//import { db, userRoles } from '../../../db'

export const UserRoleRepository = {
  create: (userId: string, roleId: string) => {
    return db
      .insert(userRoles)
      .values({
        userId,
        roleId,
      })
      .returning()
  },

  exists: async (userId: string, roleId: string) => {
    const result = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    })

    return !!result
  },

  findByUserId: (userId: string) => {
    return db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
    })
  },

  delete: (userId: string, roleId: string) => {
    return db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
  },
}
