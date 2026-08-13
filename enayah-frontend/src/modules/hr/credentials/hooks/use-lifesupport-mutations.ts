import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import {
  credentialLifeSupportService,
  type CreateLifeSupportPayload,
  type UpdateLifeSupportPayload,
} from '../services/credential-lifesupport.service'

type CreateLifeSupportMutationPayload = Omit<
  CreateLifeSupportPayload,
  'employeeId'
>

type UpdateLifeSupportMutationPayload = Omit<
  UpdateLifeSupportPayload,
  'employeeId'
>

export function useCreateLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: CreateLifeSupportMutationPayload) =>
      credentialLifeSupportService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('createSuccess', {
          name: isRtl ? 'دعم الحياة' : 'Life Support',
        }),
      )
    },
    onError: () => {
      toast.error(
        t.rich('createError', { name: isRtl ? 'دعم الحياة' : 'Life Support' }),
      )
    },
  })
}

export function useUpdateLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: UpdateLifeSupportMutationPayload) =>
      credentialLifeSupportService.update({ employeeId, ...payload }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `دعم الحياة ${variables.type}`
            : `Life Support ${variables.type}`,
        }),
      )
    },

    onError: (_error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: isRtl
            ? `دعم الحياة ${variables.type}`
            : `Life Support ${variables.type}`,
        }),
      )
    },
  })
}

export function useDeleteLifeSupport(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (id: string) =>
      credentialLifeSupportService.delete({ employeeId, id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('deleteSuccess', {
          name: isRtl ? 'دعم الحياة' : 'Life Support',
        }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('deleteError', { name: isRtl ? 'دعم الحياة' : 'Life Support' }),
      )
    },
  })
}
