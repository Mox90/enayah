// enayah-frontend/src/modules/hr/credentials/hooks/use-membership-mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import {
  CreateMembershipPayload,
  credentialMembershipService,
  UpdateMembershipPayload,
} from '../services/credential-membership.service'

type CreateMembershipMutationPayload = Omit<
  CreateMembershipPayload,
  'employeeId'
>

type UpdateMembershipMutationPayload = Omit<
  UpdateMembershipPayload,
  'employeeId'
>

export function useCreateMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: CreateMembershipMutationPayload) =>
      credentialMembershipService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('createSuccess', { name: isRtl ? 'عضوية' : 'Membership' }),
      )
    },
    onError: () => {
      toast.error(
        t.rich('createError', { name: isRtl ? 'عضوية' : 'membership' }),
      )
    },
  })
}

export function useUpdateMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: UpdateMembershipMutationPayload) =>
      credentialMembershipService.update({ employeeId, ...payload }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `عضوية ${variables.membershipNumber}`
            : `Membership ${variables.membershipNumber}`,
        }),
      )
    },

    onError: (ـerror, variables) => {
      toast.error(
        t.rich('updateError', {
          name: isRtl
            ? `عضوية ${variables.membershipNumber}`
            : `membership ${variables.membershipNumber}`,
        }),
      )
    },
  })
}

export function useDeleteMembership(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (id: string) =>
      credentialMembershipService.delete({ employeeId, id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('deleteSuccess', { name: isRtl ? 'عضوية' : 'Membership' }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('deleteError', { name: isRtl ? 'عضوية' : 'membership' }),
      )
    },
  })
}
