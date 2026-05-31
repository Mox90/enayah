import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { positionItemService } from '../services/position.item.service'
import { toast } from 'sonner'

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  const t = useTranslations('positionItems')

  return useMutation({
    mutationFn: positionItemService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      toast.success(t('createSuccess'))
    },

    onError: () => {
      toast.error(t('createError'))
    },
  })
}
