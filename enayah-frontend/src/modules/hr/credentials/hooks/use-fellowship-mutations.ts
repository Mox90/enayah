import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import {
  credentialFellowshipService,
  type CreateFellowshipPayload,
  type UpdateFellowshipPayload,
} from '../services/credential-fellowship.service'

type CreateFellowshipMutationPayload = Omit<
  CreateFellowshipPayload,
  'employeeId'
>

type UpdateFellowshipMutationPayload = Omit<
  UpdateFellowshipPayload,
  'employeeId'
>

export function useCreateFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar' //locale.includes('/ar')

  return useMutation({
    mutationFn: (payload: CreateFellowshipMutationPayload) =>
      credentialFellowshipService.create({
        employeeId,
        ...payload,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('createSuccess', { name: isRtl ? 'الزمالة' : 'Fellowship' }),
      )
    },
    onError: () => {
      toast.error(
        t.rich('createError', { name: isRtl ? 'الزمالة' : 'fellowship' }),
      )
    },
  })
}

export function useUpdateFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: UpdateFellowshipMutationPayload) =>
      credentialFellowshipService.update({ employeeId, ...payload }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `الزمالة ${variables.fellowshipName}`
            : `Fellowship ${variables.fellowshipName}`,
        }),
      )
    },

    onError: (_error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: isRtl
            ? `الزمالة ${variables.fellowshipName}`
            : `fellowship ${variables.fellowshipName}`,
        }),
      )
    },
  })
}

export function useDeleteFellowship(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (id: string) =>
      credentialFellowshipService.delete({ employeeId, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('deleteSuccess', { name: isRtl ? 'الزمالة' : 'Fellowship' }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('deleteError', { name: isRtl ? 'الزمالة' : 'fellowship' }),
      )
    },
  })
}
