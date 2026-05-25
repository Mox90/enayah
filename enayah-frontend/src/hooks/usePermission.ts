import { usePermissionStore } from '@/stores/permission.store'

export function usePermission(permission: string) {
  return usePermissionStore((state) => state.permissions.includes(permission))
}
