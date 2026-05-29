'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { departmentService } from '../services/department.service'
import { toast } from 'sonner'

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })

      toast.success('Department deleted successfully')
    },

    onError: () => {
      toast.error('Unable to delete department')
    },
  })
}
