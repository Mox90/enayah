'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { departmentService } from '../services/department.service'
import { toast } from 'sonner'

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      departmentService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })

      toast.success('Department updated successfully')
    },

    onError: () => {
      toast.error('Unable to update department')
    },
  })
}
