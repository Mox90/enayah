'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { api } from '@/lib/api/client'
//import dynamic from 'next/dynamic'
import Loader from '../animations/loader'
import { refreshAccessToken } from '@/lib/api/refresh-token'

//const Loader = dynamic(() => import('../ui/loader'), { ssr: false })
/*const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const accessToken = useAuthStore((state) => state.accessToken)
  //const isHydrated = useAuthStore((state) => state.isHydrated)
  //const [loading, setLoading] = useState(true)
  const setHydrated = useAuthStore((state) => state.setHydrated)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    if (accessToken) {
      return
    }

    const restoreSession = async () => {
      //setIsRestoring(true)
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
        logout()

        //const hasExistingSession =
        //  useAuthStore.getState().isAuthenticated &&
        //  useAuthStore.getState().accessToken

        //if (!hasExistingSession) {
        //  logout()
        //}
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          console.error('Session restore failed:', error)
        }
      } finally {
        setHydrated(true)
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [login, logout, setHydrated])

  if (isRestoring) {
    return (
      // <div className='flex h-screen items-center justify-center'>
      //   Loading...
      // </div>
      <Loader />
    )
  }

  return children
}*/

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

        const meResponse = await api.get(
          '/iam/auth/me',

          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
        )

        login(
          newAccessToken,

          meResponse.data.user,
        )
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout()
        }

        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          console.error(
            'Session restore failed:',

            error,
          )
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
