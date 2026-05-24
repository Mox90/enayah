import { create } from 'zustand'

interface User {
  id: string
  username: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  accessToken: string | null

  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, accessToken: null })
  },
}))
