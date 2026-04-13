import { AppError } from '../../../../core/errors/AppError'
import { PermissionCache } from '../../../../core/security/permissionCache'
import { UserRoleRepository } from '../repository/userRole.repository'

export const UserRoleService = {
  assignRoleToUser: async (userId: string, roleId: string) => {
    const alreadyExists = await UserRoleRepository.exists(userId, roleId)
    if (alreadyExists) {
      throw new AppError('User already has this role assigned', 409)
    }

    const result = await UserRoleRepository.create(userId, roleId)

    if (!result) throw new AppError('User already has this role', 409)

    PermissionCache.invalidate(userId)

    return { message: 'Role assigned to user successfully' }
  },

  getUserRoles: async (userId: string) => {
    return await UserRoleRepository.findByUserId(userId)
  },

  removeRoleFromUser: async (userId: string, roleId: string) => {
    await UserRoleRepository.delete(userId, roleId)
  },
}
