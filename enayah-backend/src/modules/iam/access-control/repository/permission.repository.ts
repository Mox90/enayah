import { eq, inArray } from 'drizzle-orm'
import { db, permissions, rolePermissions, userRoles } from '../../../../db'

export const PermissionRepository = {
  findPermissionsByUserId: async (userId: string) => {
    const roles = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
    })

    const roleIds = roles.map((r) => r.roleId)

    if (roleIds.length === 0) return []

    const result = await db
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds))

    return result.map((r) => r.name)
  },
}
