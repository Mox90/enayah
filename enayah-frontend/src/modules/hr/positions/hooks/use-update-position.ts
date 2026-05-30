'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { positionService } from '../services/position.service'
import { toast } from 'sonner'

export function useUpdatePosition() {
  const queryClient = useQueryClient()
  const t = useTranslations('positions')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      positionService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions'],
      })

      toast.success(t('updateSuccess'))
    },

    onError: () => {
      toast.error(t('updateError'))
    },
  })
}
