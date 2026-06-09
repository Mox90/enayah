'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { User } from '../types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean

  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  login: (token: string, user: User) => void
  logout: () => void
  restore: (token: string, user: User) => void

  setHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setHydrated: (value) =>
    set({
      isHydrated: value,
    }),

  setUser: (user) =>
    set({
      user,
    }),

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

  restore: (token: string, user: User) => {
    set({
      user,
      accessToken: token,
      isAuthenticated: true,
    })
  },
}))
