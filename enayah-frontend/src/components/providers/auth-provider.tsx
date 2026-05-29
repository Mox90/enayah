'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { api } from '@/lib/api/client'
//import dynamic from 'next/dynamic'
import Loader from '../animations/loader'
import { refreshAccessToken } from '@/lib/api/refresh-token'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setHydrated = useAuthStore((state) => state.setHydrated)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    if (accessToken) {
      return
    }

    const restoreSession = async () => {
      try {
        const newAccessToken = await refreshAccessToken()

        const meResponse = await api.get('/iam/auth/me', {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        })

        login(newAccessToken, meResponse.data.user)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout()
        }

        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          console.error('Session restore failed:', error)
        }
      } finally {
        setHydrated(true)
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [accessToken, login, logout, setHydrated])

  if (isRestoring && !accessToken) {
    return <Loader />
  }

  return children
}

export default AuthProvider
