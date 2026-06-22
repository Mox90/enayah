// src/modules/hr/employees/hire/hooks/use-hire-employee.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HireEmployeePayload } from '../types/onboarding.types'
import { onboardService } from '../service/onboarding.service'
import { toast } from 'sonner'
//import { hireService } from '../services/hire.service'
//import { HireEmployeePayload } from '../types/hire.types'

export function useOnboardEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: HireEmployeePayload) =>
      onboardService.submit(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      })

      //toast.success('Employee has bee created successfully.')
    },
  })
}
