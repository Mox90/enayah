// enayah-backend/src/modules/hr/iqama-renewal-process/types/iqama-renewal-case-comment.types.ts

import { z } from 'zod'

import type { IqamaRenewalStatus } from './iqama-renewal-process.types'

export const iqamaRenewalCommentBodySchema = z
  .string()
  .trim()
  .min(1, 'Comment is required.')
  .max(2000, 'Comment must not exceed 2000 characters.')

export const createIqamaRenewalCommentSchema = z.object({
  body: iqamaRenewalCommentBodySchema,
})

export const iqamaRenewalCaseParamsSchema = z.object({
  id: z.string().uuid('Invalid Iqama renewal case ID.'),
})

export const iqamaRenewalCommentReplyParamsSchema = z.object({
  id: z.string().uuid('Invalid Iqama renewal case ID.'),

  commentId: z.string().uuid('Invalid Iqama renewal comment ID.'),
})

export type CreateIqamaRenewalCommentInput = z.infer<
  typeof createIqamaRenewalCommentSchema
>

export type IqamaRenewalCaseDiscussionContext = {
  id: string
  employeeId: string

  employeeNumber: string | null
  employeeNameEn: string | null
  employeeNameAr: string | null

  assignedToUserId: string | null
  status: IqamaRenewalStatus
  createdBy: string | null
}

export type CreateCommentActivityInput = {
  renewalCase: IqamaRenewalCaseDiscussionContext
  actorUserId: string
  body: string
  parentCommentId?: string | null
}

export type CommentNotificationRecipientsInput = {
  caseId: string
  actorUserId: string
  assignedToUserId: string | null
  caseCreatedBy: string | null
  parentAuthorUserId: string | null
  threadRootAuthorUserId: string | null
}

export type CreateCommentNotificationInput = {
  commentId: string
  caseId: string
  employeeId: string

  employeeNumber: string | null
  employeeName: string | null

  body: string
  isReply: boolean

  parentCommentId: string | null
  threadRootId: string | null

  recipientUserIds: string[]
}

export type CreateIqamaRenewalCaseCommentData = {
  caseId: string
  authorUserId: string
  body: string
  statusAtTime: IqamaRenewalStatus
  parentCommentId: string | null
  threadRootId: string | null
}
