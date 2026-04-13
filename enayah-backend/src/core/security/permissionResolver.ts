import { PermissionRepository } from '../../modules/iam/access-control/repository/permission.repository'
import { PermissionCache } from './permissionCache'

export const resolvePermissions = async (userId: string) => {
  // 🔥 1. Check cache
  const cached = PermissionCache.get(userId)
  if (cached) return cached

  // 🔥 2. Fetch from DB
  const permissions = await PermissionRepository.findPermissionsByUserId(userId)

  // 🔥 3. Store in cache
  PermissionCache.set(userId, permissions)

  return permissions
}
