import { api } from '@/lib/api/client'
import { refreshAccessToken } from '@/lib/api/refresh-token'

import { useAuthStore } from '../stores/auth.store'
import { usePermissionStore } from '../stores/permission.store'

export async function bootstrapAuth() {
  const authStore = useAuthStore.getState()

  try {
    const accessToken = await refreshAccessToken()
    authStore.setAccessToken(accessToken)
    const me = await api.get('/iam/auth/me')
    const user = me.data.user
    authStore.setUser(user)
    const permissions =
      user.roles?.flatMap(
        (r: any) => r.permissions?.map((p: any) => p.code) || [],
      ) || []

    usePermissionStore.getState().setPermissions(permissions)
  } catch {
    authStore.logout()
  } finally {
    authStore.setHydrated(true)
  }
}
