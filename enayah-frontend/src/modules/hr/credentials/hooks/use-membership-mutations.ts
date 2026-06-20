import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  CreateMembershipPayload,
  credentialMembershipService,
  UpdateMembershipPayload,
} from '../services/credential-membership.service'

export function useCreateMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateMembershipPayload, 'employeeId'>) =>
      credentialMembershipService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('createSuccess', { name: 'Membership' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'membership' }))
    },
  })
}

export function useUpdateMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateMembershipPayload) =>
      credentialMembershipService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: `Membership ${variables.membershipNumber}`,
        }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: `membership ${variables.membershipNumber}`,
        }),
      )
    },
  })
}

export function useDeleteMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialMembershipService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'Membership' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'membership' }))
    },
  })
}
