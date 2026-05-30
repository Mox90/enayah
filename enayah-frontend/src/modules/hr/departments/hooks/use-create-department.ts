import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { departmentService } from '../services/department.service'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  const t = useTranslations('departments')

  return useMutation({
    mutationFn: departmentService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })

      toast.success(t('createSuccess'))
    },

    onError: () => {
      toast.error(t('createError'))
    },
  })
}
