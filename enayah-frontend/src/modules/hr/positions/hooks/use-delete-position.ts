import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { positionService } from '../services/position.service'
import { toast } from 'sonner'

export function useDeletePosition() {
  const queryClient = useQueryClient()
  const t = useTranslations('positions')

  return useMutation({
    mutationFn: (id: string) => positionService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions'],
      })

      toast.success(t('deleteSuccess'))
    },

    onError: () => {
      toast.error(t('deleteError'))
    },
  })
}
