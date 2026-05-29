import { useMutation, useQueryClient } from '@tanstack/react-query'
import { positionService } from '../services/position.service'
import { toast } from 'sonner'

export function useCreatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: positionService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions'],
      })

      toast.success('Job Position created successfully')
    },

    onError: () => {
      toast.error('Unable to create job position')
    },
  })
}
