'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { departmentService } from '../services/department.service'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  const t = useTranslations('departments')

  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })

      toast.success(t('deleteSuccess'))
    },

    onError: () => {
      toast.error(t('deleteError'))
    },
  })
}
