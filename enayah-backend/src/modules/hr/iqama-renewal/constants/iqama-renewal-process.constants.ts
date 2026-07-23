// enayah-backend/src/modules/hr/iqama-renewal-process/iqama-renewal-process.constants.ts

export const DISCUSSION_ADMIN_ROLES = ['HR_ADMIN', 'HR_DIRECTOR'] as const

export const GOVERNMENT_RELATIONS_ROLE = 'HR_GOVERNMENT_RELATION' as const

export const IQAMA_COMMENT_SOURCE_TYPE = 'iqama_renewal_case_comment' as const

export const IQAMA_COMMENT_NOTIFICATION_TYPES = {
  comment: 'iqama_case_comment',
  reply: 'iqama_case_comment_reply',
} as const

export const IQAMA_COMMENT_NOTIFICATION_MILESTONES = {
  comment: 'comment_created',
  reply: 'reply_created',
} as const

export const IQAMA_RENEWAL_CASE_SOURCE_TYPE = 'iqama_renewal_case' as const
