'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { departmentService } from '../services/department.service'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  const t = useTranslations('departments')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      departmentService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })

      toast.success(t('updateSuccess'))
    },

    onError: () => {
      toast.error(t('updateError'))
    },
  })
}
