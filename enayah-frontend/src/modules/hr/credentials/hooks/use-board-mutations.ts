import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import {
  CreateBoardPayload,
  credentialBoardService,
  UpdateBoardPayload,
} from '../services/credential-board.service'
import { toast } from 'sonner'

export function useCreateBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return useMutation({
    mutationFn: (payload: Omit<CreateBoardPayload, 'employeeId'>) =>
      credentialBoardService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('createSuccess', { name: isRtl ? 'مجلس' : 'Board' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: isRtl ? 'مجلس' : 'board' }))
    },
  })
}

export function useUpdateBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return useMutation({
    mutationFn: (payload: UpdateBoardPayload) =>
      credentialBoardService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee_credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `مجلس ${variables.boardName}`
            : `Board ${variables.boardName}`,
        }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: isRtl
            ? `مجلس ${variables.boardName}`
            : `board ${variables.boardName}`,
        }),
      )
    },
  })
}

export function useDeleteBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return useMutation({
    mutationFn: (id: string) => credentialBoardService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee_credentials', employeeId],
      })
      toast.success(t.rich('deleteSuccess', { name: isRtl ? 'مجلس' : 'Board' }))
    },
    onError: () => {
      toast.error(t.rich('deleteError', { name: isRtl ? 'مجلس' : 'board' }))
    },
  })
}
