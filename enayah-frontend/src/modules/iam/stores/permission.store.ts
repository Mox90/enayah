'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PermissionState {
  permissions: string[]

  setPermissions: (permissions: string[]) => void

  clearPermissions: () => void
}

/*export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: [],

  setPermissions: (permissions) => set({ permissions }),

  clearPermissions: () => set({ permissions: [] }),
}))*/
export const usePermissionStore = create<PermissionState>()(
  persist(
    (set) => ({
      permissions: [],
      setPermissions: (permissions) => set({ permissions }),
      clearPermissions: () => set({ permissions: [] }),
    }),
    { name: 'permission-storage' },
  ),
)
