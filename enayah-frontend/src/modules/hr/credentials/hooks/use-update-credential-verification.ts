// enayah-frontend/src/modules/hr/credentials/hooks/use-update-degree-verification.ts

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { credentialVerificationServices } from '../services/credential-verification.service'

import { employeeCredentialsQueryKeys } from './use-employee-credentials'
import { CredentialKind } from '../config/credential-resource.config'

type UpdateCredentialVerificationMutationPayload = {
  kind: CredentialKind
  credentialId: string
  isVerified: boolean
  remarks: string | null
  evidenceFile?: File
}

export function useUpdateCredentialVerification(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      kind,
      credentialId,
      isVerified,
      remarks,
      evidenceFile,
    }: UpdateCredentialVerificationMutationPayload) => {
      const service = credentialVerificationServices[kind]

      return service.updateVerification({
        employeeId,
        credentialId,
        isVerified,
        remarks,
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
