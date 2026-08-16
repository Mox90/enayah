import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import {
  credentialMalpracticeService,
  type CreateMalpracticePayload,
  type UpdateMalpracticePayload,
} from '../services/credential-malpractice.service'

type CreateMalpracticeMutationPayload = Omit<
  CreateMalpracticePayload,
  'employeeId'
>

type UpdateMalpracticeMutationPayload = Omit<
  UpdateMalpracticePayload,
  'employeeId'
>

export function useCreateMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: CreateMalpracticeMutationPayload) =>
      credentialMalpracticeService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('createSuccess', {
          name: isRtl
            ? 'وثيقة تأمين ضد الأخطاء الطبية'
            : 'Medical malpractice insurance',
        }),
      )
    },
    onError: () => {
      toast.error(
        t.rich('createError', {
          name: isRtl
            ? 'وثيقة تأمين ضد الأخطاء الطبية'
            : 'Medical malpractice insurance',
        }),
      )
    },
  })
}

export function useUpdateMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: UpdateMalpracticeMutationPayload) =>
      credentialMalpracticeService.update({ employeeId, ...payload }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `وثيقة تأمين ضد الأخطاء الطبية ${variables.insuranceCompany}`
            : `Malpractice insurance ${variables.insuranceCompany}`,
        }),
      )
    },

    onError: (_error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: isRtl
            ? `وثيقة تأمين ضد الأخطاء الطبية ${variables.insuranceCompany}`
            : `Malpractice insurance ${variables.insuranceCompany}`,
        }),
      )
    },
  })
}

export function useDeleteMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (id: string) =>
      credentialMalpracticeService.delete({ employeeId, id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('deleteSuccess', {
          name: isRtl
            ? 'وثيقة تأمين ضد الأخطاء الطبية'
            : 'Malpractice Insurance',
        }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('deleteError', {
          name: isRtl
            ? 'وثيقة تأمين ضد الأخطاء الطبية'
            : 'malpractice Insurance',
        }),
      )
    },
  })
}
