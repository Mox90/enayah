import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  CreateMalpracticePayload,
  credentialMalpracticeService,
  UpdateMalpracticePayload,
} from '../services/credential-malpractice.service'

export function useCreateMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateMalpracticePayload, 'employeeId'>) =>
      credentialMalpracticeService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('createSuccess', { name: 'Malpractice insurance' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'malpractice insurance' }))
    },
  })
}

export function useUpdateMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateMalpracticePayload) =>
      credentialMalpracticeService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: `Malpractice insurance ${variables.insuranceCompany}`,
        }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: `malpractice insurance ${variables.insuranceCompany}`,
        }),
      )
    },
  })
}

export function useDeleteMalpractice(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialMalpracticeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'Malpractice Insurance' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'malpractice insurance' }))
    },
  })
}
