// enayah-frontend/src/modules/hr/contracts/hooks/use-renew-contract.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { contractService } from '../services/contract.service'
import { RenewContractPayload } from '../types/contract-renewal.types'
import { employeeQueryKeys } from '../../employees/hooks/use-employee-profile'
import axios from 'axios'

type ApiErrorResponse = {
  message?: string
}

export function useRenewContract(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RenewContractPayload) =>
      contractService.renew(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employment-timeline', employeeId],
      })

      // queryClient.invalidateQueries({
      //   queryKey: ['employee-profile', employeeId],
      // })

      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.profile(employeeId),
      })

      queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      toast.success('Contract renewed successfully', {
        duration: 5000,
      })
    },

    onError: (error: unknown) => {
      let message = 'Failed to renew contract'

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
