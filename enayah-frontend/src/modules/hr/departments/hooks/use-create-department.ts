import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { departmentService } from '../services/department.service'

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['departments'],
      })
    },
  })
}
