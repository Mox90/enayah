'use client'

import { useAuthStore } from '@/modules/iam/stores/auth.store'
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${process.env.NEXT_PUBLIC_API_URL}/iam/auth/refresh`,
            {},
            {
              withCredentials: true,
            },
          )
          .then((res) => {
            const newToken = res.data.accessToken

            useAuthStore.getState().setAccessToken(newToken)

            return newToken
          })

          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const newToken = await refreshPromise

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()

        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
