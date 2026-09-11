// enayah-frontend/src/modules/hr/positions-items/hooks/use-delete-position-item.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { positionItemService } from '../services/position.item.service'

export function useDeletePositionItem() {
  const queryClient = useQueryClient()
  const t = useTranslations('positionItems')

  return useMutation({
    mutationFn: positionItemService.delete,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      void queryClient.invalidateQueries({
        queryKey: ['position-item-lookup'],
      })

      toast.success(t('deleteSuccess'))
    },

    onError: () => {
      toast.error(t('deleteError'))
    },
  })
}
