//import { db, rolePermissions } from '../../../db'

import { eq, and } from 'drizzle-orm'
import { db, rolePermissions } from '../../../../db'

export const RolePermissionRepository = {
  bulkInsert: async (roleId: string, permissionIds: string[]) => {
    const values = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }))

    return db.insert(rolePermissions).values(values)
  },

  findByRoleId: (roleId: string) => {
    return db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, roleId),
    })
  },

  delete: (roleId: string, permissionId: string) => {
    return db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId),
        ),
      )
  },
}
