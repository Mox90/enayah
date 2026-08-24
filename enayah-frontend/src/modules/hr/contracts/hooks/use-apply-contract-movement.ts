// enayah-frontend/src/modules/hr/contracts/hooks/use-apply-contract-movement.ts

import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { employeeQueryKeys } from '../../employees/hooks/employee-query-keys'
import { contractService } from '../services/contract.service'

import type { ApplyContractMovementPayload } from '../types/contract-movement.types'
import { useTranslations } from 'next-intl'

type ApiErrorResponse = {
  message?: string
}

export function useApplyContractMovement(employeeId: string) {
  const queryClient = useQueryClient()
  const ert = useTranslations('errors')
  const cnt = useTranslations('contracts')

  return useMutation({
    mutationFn: (payload: ApplyContractMovementPayload) =>
      contractService.applyMovement(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employment-timeline', employeeId],
      })

      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.profile(employeeId),
      })

      queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      /*
       * Amendment changes the latest legal movement
       * and may also change compensation.
       */
      queryClient.invalidateQueries({
        queryKey: ['contract-renewal-defaults', variables.currentContractId],
      })

      toast.success(cnt('amendSuccess'), {
        duration: 5000,
      })
    },

    onError: (error: unknown) => {
      let message = ert('failedAmend')

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        message = error.response?.data?.message ?? message
      } else if (error instanceof Error) {
        message = error.message
      }

      toast.error(message, {
        duration: 7000,
      })
    },
  })
}
