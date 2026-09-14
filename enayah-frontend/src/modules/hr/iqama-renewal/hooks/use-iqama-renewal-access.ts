// enayah-frontend/src/modules/hr/iqama-renewal/hooks/use-iqama-renewal-access.ts

'use client'

import { useAuthStore } from '@/modules/iam/stores/auth.store'

export interface IqamaRenewalAccess {
  canManageWorkflow: boolean
  canProcessGovernmentRelations: boolean
  canCommentOnCase: boolean
  currentUserId: string | null
}

export function useIqamaRenewalAccess(): IqamaRenewalAccess {
  const user = useAuthStore((state) => state.user)

  const roles = user?.roles?.map((role) => role.name) ?? []

  return {
    canManageWorkflow: roles.includes('HR_ADMIN'),

    canProcessGovernmentRelations: roles.includes('HR_GOVERNMENT_RELATION'),

    canCommentOnCase: roles.some((role) =>
      ['HR_ADMIN', 'HR_GOVERNMENT_RELATION', 'HR_DIRECTOR'].includes(role),
    ),

    currentUserId: user?.id ?? null,
  }
}
