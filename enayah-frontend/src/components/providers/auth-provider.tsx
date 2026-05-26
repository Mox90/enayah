'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { api } from '@/lib/api/client'
//import dynamic from 'next/dynamic'
import Loader from '../animations/loader'

//const Loader = dynamic(() => import('../ui/loader'), { ssr: false })
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

    const restoreSession = async () => {
      setIsRestoring(true)
      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/iam/auth/refresh`,
          //'/iam/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        )

        const newAccessToken = refreshResponse.data.accessToken

        const meResponse = await api.get('/iam/auth/me', {
          //const meResponse = await api.get('/iam/auth/me', {
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
      // <div className='flex h-screen items-center justify-center'>
      //   Loading...
      // </div>
      <Loader />
    )
  }

  return children
}

export default AuthProvider
