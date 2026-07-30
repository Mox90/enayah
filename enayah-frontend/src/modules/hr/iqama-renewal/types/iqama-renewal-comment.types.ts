// enayah-frontend/src/modules/hr/iqama-renewal/types/iqama-renewal-comment.types.ts

import type { IqamaRenewalStatus } from './iqama-renewal.types'

export type IqamaRenewalCaseComment = {
  id: string
  caseId: string
  authorUserId: string

  parentCommentId: string | null
  threadRootId: string | null

  body: string
  statusAtTime: IqamaRenewalStatus
  createdAt: string

  authorUsername: string | null
  authorEmail: string | null
  authorNameEn: string | null
  authorNameAr: string | null

  employeeId: string | null
  authorAvatar: string | null
}

export type IqamaRenewalCaseCommentNode = IqamaRenewalCaseComment & {
  replies: IqamaRenewalCaseCommentNode[]
}

export type CreateIqamaRenewalCommentPayload = {
  body: string
}

export type ReplyToIqamaRenewalCommentPayload = {
  body: string
}
