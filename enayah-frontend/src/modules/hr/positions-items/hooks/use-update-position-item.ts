// enayah-frontend/src/modules/hr/positions-items/hooks/use-update-position-item.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import type { CreateJobPositionItemFormValues } from '../schemas/position.items.schema'
import { positionItemService } from '../services/position.item.service'

interface UpdatePositionItemInput {
  id: string
  data: CreateJobPositionItemFormValues
}

export function useUpdatePositionItem() {
  const queryClient = useQueryClient()
  const t = useTranslations('positionItems')

  return useMutation({
    mutationFn: ({ id, data }: UpdatePositionItemInput) =>
      positionItemService.update(id, data),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      void queryClient.invalidateQueries({
        queryKey: ['position-item-lookup'],
      })

      toast.success(t('updateSuccess'))
    },

    onError: () => {
      toast.error(t('updateError'))
    },
  })
}
