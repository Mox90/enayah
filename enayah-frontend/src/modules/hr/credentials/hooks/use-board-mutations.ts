// enayah-frontend/src/modules/hr/credentials/hooks/use-board-mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import {
  credentialBoardService,
  type CreateBoardPayload,
  type UpdateBoardPayload,
} from '../services/credential-board.service'

type CreateBoardMutationPayload = Omit<CreateBoardPayload, 'employeeId'>

type UpdateBoardMutationPayload = Omit<UpdateBoardPayload, 'employeeId'>

export function useCreateBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return useMutation({
    mutationFn: (payload: CreateBoardMutationPayload) =>
      credentialBoardService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
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
    mutationFn: (payload: UpdateBoardMutationPayload) =>
      credentialBoardService.update({ employeeId, ...payload }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('updateSuccess', {
          name: isRtl
            ? `مجلس ${variables.boardName}`
            : `Board ${variables.boardName}`,
        }),
      )
    },

    onError: (_error, variables) => {
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
    mutationFn: (id: string) =>
      credentialBoardService.delete({ employeeId, id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
      toast.success(t.rich('deleteSuccess', { name: isRtl ? 'مجلس' : 'Board' }))
    },
    onError: () => {
      toast.error(t.rich('deleteError', { name: isRtl ? 'مجلس' : 'board' }))
    },
  })
}
