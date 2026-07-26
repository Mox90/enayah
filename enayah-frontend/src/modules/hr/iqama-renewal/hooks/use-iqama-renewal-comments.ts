// enayah-frontend/src/modules/hr/iqama-renewal/hooks/use-iqama-renewal-comments.ts

import { isAxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createIqamaRenewalCaseComment,
  getIqamaRenewalCaseComments,
  replyToIqamaRenewalCaseComment,
} from '../services/iqama-renewal-comment.service'

import type {
  CreateIqamaRenewalCommentPayload,
  ReplyToIqamaRenewalCommentPayload,
} from '../types/iqama-renewal-comment.types'

export const iqamaRenewalCommentKeys = {
  all: ['iqama-renewal-case-comments'] as const,

  lists: () => [...iqamaRenewalCommentKeys.all, 'list'] as const,

  list: (caseId: string) =>
    [...iqamaRenewalCommentKeys.lists(), caseId] as const,
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return fallback
  }

  const responseData = error.response?.data as
    | {
        message?: string
        error?: {
          message?: string
        }
      }
    | undefined

  return responseData?.message || responseData?.error?.message || fallback
}

export function useIqamaRenewalCaseComments(caseId?: string | null) {
  const normalizedCaseId = caseId ?? ''

  return useQuery({
    queryKey: iqamaRenewalCommentKeys.list(normalizedCaseId),

    queryFn: () => getIqamaRenewalCaseComments(normalizedCaseId),

    enabled: Boolean(caseId),

    /*
     * Discussion data does not need to refetch constantly.
     * It is invalidated after comment/reply mutations.
     */
    staleTime: 15_000,
  })
}

export function useCreateIqamaRenewalCaseComment(caseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateIqamaRenewalCommentPayload) =>
      createIqamaRenewalCaseComment(caseId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: iqamaRenewalCommentKeys.list(caseId),
      })

      toast.success('Comment posted.')
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to post the comment.'))
    },
  })
}

export function useReplyToIqamaRenewalCaseComment(caseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string
      payload: ReplyToIqamaRenewalCommentPayload
    }) => replyToIqamaRenewalCaseComment(caseId, commentId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: iqamaRenewalCommentKeys.list(caseId),
      })

      toast.success('Reply posted.')
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to post the reply.'))
    },
  })
}
