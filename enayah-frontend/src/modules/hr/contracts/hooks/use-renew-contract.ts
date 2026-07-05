// src/modules/hr/contracts/hooks/use-renew-contract.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { contractService } from '../services/contract.service'
import { RenewContractPayload } from '../types/contract-renewal.types'

export function useRenewContract(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RenewContractPayload) =>
      contractService.renew(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employment-timeline', employeeId],
      })

      queryClient.invalidateQueries({
        queryKey: ['employee-profile', employeeId],
      })

      queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      toast.success('Contract renewed successfully', {
        duration: 5000,
      })
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to renew contract',
        {
          duration: 7000,
        },
      )
    },
  })
}
