import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'
import { UpdateEmployeeDto } from '../types/employee-request.types'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

type UpdateEmployeePayload = {
  id: string
  data: UpdateEmployeeDto
}

export const useUpdatePersonalMutation = () => {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: ({ id, data }: UpdateEmployeePayload) =>
      employeeService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-profile'],
      })

      queryClient.invalidateQueries({
        queryKey: ['employees'],
      })

      toast.success(t('updateSuccess', { name: 'Employee' }))
    },

    onError: () => {
      toast.error(t('updateError', { name: 'employee' }))
    },
  })
}
