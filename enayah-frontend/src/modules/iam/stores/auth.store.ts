'use client'

//import { User } from '@/types/auth.types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  setUser: (user: User | null) => void

  setAccessToken: (token: string | null) => void

  login: (token: string, user: User) => void

  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      accessToken: null,

      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: !!token,
        }),

      login: (token, user) => {
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },
    }),

    {
      name: 'auth-storage',
    },
  ),
)
