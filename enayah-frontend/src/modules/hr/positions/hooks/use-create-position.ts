import { useMutation, useQueryClient } from '@tanstack/react-query'
import { positionService } from '../services/position.service'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useCreatePosition() {
  const queryClient = useQueryClient()
  const t = useTranslations('positions')

  return useMutation({
    mutationFn: positionService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions'],
      })

      toast.success(t('createSuccess'))
    },

    onError: () => {
      toast.error(t('createError'))
    },
  })
}
