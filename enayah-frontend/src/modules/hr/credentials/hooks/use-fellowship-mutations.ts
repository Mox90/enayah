import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  CreateFellowshipPayload,
  credentialFellowshipService,
  UpdateFellowshipPayload,
} from '../services/credential-fellowship.service'

export function useCreateFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateFellowshipPayload, 'employeeId'>) =>
      credentialFellowshipService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('createSuccess', { name: 'Fellowship' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'fellowship' }))
    },
  })
}

export function useUpdateFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateFellowshipPayload) =>
      credentialFellowshipService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: `Fellowship ${variables.fellowshipName}`,
        }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: `fellowship ${variables.fellowshipName}`,
        }),
      )
    },
  })
}

export function useDeleteFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialFellowshipService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'Fellowship' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'fellowship' }))
    },
  })
}
