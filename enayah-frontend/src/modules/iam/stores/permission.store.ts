'use client'

import { create } from 'zustand'

interface PermissionState {
  permissions: string[]

  setPermissions: (permissions: string[]) => void

  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: [],

  setPermissions: (permissions) => set({ permissions }),

  clearPermissions: () => set({ permissions: [] }),
}))
