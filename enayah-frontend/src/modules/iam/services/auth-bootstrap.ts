// enayah-frontend/src/modules/iam/services/auth-bootstrap.ts

import { api } from '@/lib/api/client'
import { refreshAccessToken } from '@/lib/api/refresh-token'

import { useAuthStore } from '../stores/auth.store'
import { usePermissionStore } from '../stores/permission.store'
import { User } from '../types/auth.types'
import axios from 'axios'

export function extractPermissions(user: User): string[] {
  return (
    user.roles?.flatMap(
      (role) => role.permissions?.map((permission) => permission.code) ?? [],
    ) ?? []
  )
}

export async function bootstrapAuth() {
  const authStore = useAuthStore.getState()
  const permissionStore = usePermissionStore.getState()

  try {
    const accessToken = await refreshAccessToken()

    const me = await api.get('/iam/auth/me')
    const user: User = me.data.user

    //authStore.setAccessToken(accessToken)
    authStore.restore(accessToken, user)
    authStore.setUser(user)
    //const permissions = extractPermissions(user)

    permissionStore.setPermissions(extractPermissions(user))
  } catch (error: unknown) {
    //console.error('Auth bootstrap failed:', error)
    authStore.logout()
    permissionStore.clearPermissions()
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      console.error('Auth bootstrap failed:', error)
    }
  } finally {
    authStore.setHydrated(true)
  }
}
