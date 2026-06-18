import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import {
  CreateBoardPayload,
  credentialBoardService,
  UpdateBoardPayload,
} from '../services/credential-board.service'
import { toast } from 'sonner'

export function useCreateBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
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
      toast.success(t.rich('createSuccess', { name: 'Board' }))
    },
    onError: () => {
      toast.error(t.rich('createError', { name: 'board' }))
    },
  })
}

export function useUpdateBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateBoardPayload) =>
      credentialBoardService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee_credentials', employeeId],
      })
      toast.success(
        t.rich('updateSuccess', { name: `Board ${variables.boardName}` }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', { name: `board ${variables.boardName}` }),
      )
    },
  })
}

export function useDeleteBoard(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (id: string) => credentialBoardService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee_credentials', employeeId],
      })
      toast.success(t.rich('deleteSuccess', { name: 'Degree' }))
    },
    onError: () => {
      toast.error(t.rich('deleteError', { name: 'degree' }))
    },
  })
}
