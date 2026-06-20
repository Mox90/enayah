import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  CreateLifeSupportPayload,
  credentialLifeSupportService,
  UpdateLifeSupportPayload,
} from '../services/credential-lifesupport.service'

export function useCreateLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateLifeSupportPayload, 'employeeId'>) =>
      credentialLifeSupportService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('createSuccess', { name: 'License' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'license' }))
    },
  })
}

export function useUpdateLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateLifeSupportPayload) =>
      credentialLifeSupportService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', { name: `Life Support ${variables.type}` }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', { name: `life support ${variables.type}` }),
      )
    },
  })
}

export function useDeleteLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialLifeSupportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'Life Support' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'life support' }))
    },
  })
}
