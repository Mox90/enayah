'use client'

import { useAuthStore } from '@/modules/iam/stores/auth.store'
import axios from 'axios'
import { refreshAccessToken } from './refresh-token'
import { useLocale } from 'next-intl'
//import qs from 'qs'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,

  paramsSerializer: {
    indexes: null,
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/iam/auth/refresh')
    //const locale = useLocale()
    const locale =
      typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1]
        : 'en'

    if (isUnauthorized && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()

        useAuthStore.getState().setAccessToken(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()

        if (typeof window !== 'undefined') {
          window.location.href = `/${locale}/login`
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
