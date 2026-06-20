import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  credentialDegreeService,
  CreateDegreePayload,
  UpdateDegreePayload,
} from '../services/credential-degree.service'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function useCreateDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateDegreePayload, 'employeeId'>) =>
      credentialDegreeService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      // queryClient.setQueryData(
      //   ['employee-credentials', employeeId],
      //   (oldData: any[]) => {
      //     return oldData ? [...oldData, newDegree] : [newDegree]
      //   },
      // )
      toast.success(t.rich('createSuccess', { name: 'Degree' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'degree' }))
    },
  })
}

// BEST PRACTICE
// export function useUpdateDegree(employeeId: string) {
//   const queryClient = useQueryClient()
//   const t = useTranslations('credentials')
//   return useMutation<
//     Awaited<ReturnType<typeof credentialDegreeService.update>>, // Automatically gets the return type
//     Error,
//     UpdateDegreePayload
//   >({
//     mutationFn: (payload: UpdateDegreePayload) =>
//       credentialDegreeService.update(payload),

//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: ['employee-credentials', employeeId],
//       })

//       toast.success(
//         t.rich('updateSuccess', { name: `Degree ${variables.degreeName}` }),
//       )
//     },

//     onError: (error, variables) => {
//       toast.error(
//         t.rich('updateError', { name: `degree ${variables.degreeName}` }),
//       )
//     },
//   })
// }

export function useUpdateDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateDegreePayload) =>
      credentialDegreeService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', { name: `Degree ${variables.degreeName}` }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', { name: `degree ${variables.degreeName}` }),
      )
    },
  })
}

export function useDeleteDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialDegreeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'Degree' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'degree' }))
    },
  })
}
