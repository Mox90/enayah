'use client'

import { useEffect, useState } from 'react'

import axios from 'axios'

import { useAuthStore } from '@/modules/iam/stores/auth.store'

import { api } from '@/lib/api/client'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  //const [loading, setLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    if (!isHydrated || accessToken) {
      return
    }
    /*if (accessToken) {
      setLoading(false)
      return
    }*/
    const restoreSession = async () => {
      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/iam/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        )

        const newAccessToken = refreshResponse.data.accessToken

        const meResponse = await api.get('/iam/auth/me', {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        })

        //login(accessToken, meResponse.data)
        login(newAccessToken, meResponse.data.user)
      } catch (error) {
        const hasExistingSession =
          useAuthStore.getState().isAuthenticated &&
          useAuthStore.getState().accessToken

        if (!hasExistingSession) {
          logout()
        }
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          console.error('Session restore failed:', error)
        }
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [isHydrated, accessToken, login, logout])

  if (!isHydrated || isRestoring) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading...
      </div>
    )
  }

  return children
}

export default AuthProvider
