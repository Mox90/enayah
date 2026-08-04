// enayah-frontend/src/modules/hr/credentials/hooks/use-update-degree-verification.ts

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { degreeVerificationService } from '../services/credential-verification.service'

import type { CredentialVerificationUpdateResponse } from '../types/credential-verification.types'

import { employeeCredentialsQueryKeys } from './use-employee-credentials'

export type UpdateDegreeVerificationMutationInput = {
  degreeId: string
  isVerified: boolean
  remarks?: string | null
  evidenceFile?: File
}

export function useUpdateDegreeVerification(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    CredentialVerificationUpdateResponse,
    Error,
    UpdateDegreeVerificationMutationInput
  >({
    mutationFn: async ({ degreeId, isVerified, remarks, evidenceFile }) => {
      return degreeVerificationService.updateVerification({
        employeeId,
        credentialId: degreeId,
        isVerified,

        ...(remarks !== undefined
          ? {
              remarks,
            }
          : {}),

        ...(evidenceFile
          ? {
              evidenceFile,
            }
          : {}),
      })
    },

    onSuccess: async () => {
      /*
       * Refetch the enriched credential response so the UI
       * receives current verification state, actor, event,
       * and evidence metadata.
       */
      await queryClient.invalidateQueries({
        queryKey: employeeCredentialsQueryKeys.byEmployee(employeeId),
      })
    },
  })
}
