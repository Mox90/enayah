import { eq, and } from 'drizzle-orm'
import { db, rolePermissions } from '../../../../db'
import { RolePermissionRepository } from '../repository/rolePermission.repository'
import { PermissionCache } from '../../../../core/security/permissionCache'

export const RolePermissionService = {
  assignPermissions: async (roleId: string, permissionIds: string[]) => {
    await RolePermissionRepository.bulkInsert(roleId, permissionIds)

    PermissionCache.clearAll()

    return { message: 'Permissions assigned to role' }
  },

  getRolePermissions: async (roleId: string) => {
    return await RolePermissionRepository.findByRoleId(roleId)
  },

  removePermission: async (roleId: string, permissionId: string) => {
    await RolePermissionRepository.delete(roleId, permissionId)

    PermissionCache.clearAll()
  },
}
