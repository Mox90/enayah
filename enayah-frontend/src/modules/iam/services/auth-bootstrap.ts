import { api } from '@/lib/api/client'
import { refreshAccessToken } from '@/lib/api/refresh-token'

import { useAuthStore } from '../stores/auth.store'
import { usePermissionStore } from '../stores/permission.store'
import { User } from '../types/auth.types'

export function extractPermissions(user: User): string[] {
  return (
    user.roles?.flatMap((r) => r.permissions?.map((p) => p.code) || []) || []
  )
}

export async function bootstrapAuth() {
  const authStore = useAuthStore.getState()

  try {
    const accessToken = await refreshAccessToken()
    authStore.setAccessToken(accessToken)
    const me = await api.get('/iam/auth/me')
    const user = me.data.user
    authStore.setUser(user)
    // const permissions =
    //   user.roles?.flatMap(
    //     (r: any) => r.permissions?.map((p: any) => p.code) || [],
    //   ) || []
    const permissions = extractPermissions(user)

    usePermissionStore.getState().setPermissions(permissions)
  } catch (error) {
    console.error('Auth bootstrap failed:', error)
    authStore.logout()
  } finally {
    authStore.setHydrated(true)
  }
}
