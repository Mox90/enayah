// enayah-backend/src/modules/hr/iqama-renewal-process/service/iqama-renewal-case-comment.service.ts

import { and, eq, inArray } from 'drizzle-orm'

import { db, roles, userRoles, users, type DB } from '../../../../db'

import { NotificationRepository } from '../../../notifications/repository/notification.repository'

import { IqamaRenewalCaseCommentRepository } from '../repository/iqama-renewal-case-comment.repository'
import { IqamaRenewalProcessRepository } from '../repository/iqama-renewal-process.repository'

import type {
  CommentNotificationRecipientsInput,
  CreateCommentActivityInput,
  CreateCommentNotificationInput,
  CreateIqamaRenewalCommentInput,
} from '../types/iqama-renewal-case-comment.types'

import {
  IqamaRenewalProcessError,
  type IqamaRenewalCaseActor,
} from '../types/iqama-renewal-process.types'
import {
  DISCUSSION_ADMIN_ROLES,
  GOVERNMENT_RELATIONS_ROLE,
  IQAMA_COMMENT_NOTIFICATION_MILESTONES,
  IQAMA_COMMENT_NOTIFICATION_TYPES,
  IQAMA_COMMENT_SOURCE_TYPE,
} from '../constants/iqama-renewal-process.constants'

async function resolveCommentNotificationRecipients(
  tx: DB,
  input: CommentNotificationRecipientsInput,
) {
  const oversightUsers = await tx
    .selectDistinct({
      userId: users.id,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(
      and(
        inArray(roles.name, [...DISCUSSION_ADMIN_ROLES]),
        eq(userRoles.isActive, true),
      ),
    )

  const participantUsers =
    await IqamaRenewalCaseCommentRepository.findParticipantUserIds(
      tx,
      input.caseId,
    )

  const recipients = new Set<string>()

  for (const row of oversightUsers) {
    recipients.add(row.userId)
  }

  for (const row of participantUsers) {
    recipients.add(row.userId)
  }

  if (input.assignedToUserId) {
    recipients.add(input.assignedToUserId)
  }

  if (input.caseCreatedBy) {
    recipients.add(input.caseCreatedBy)
  }

  if (input.parentAuthorUserId) {
    recipients.add(input.parentAuthorUserId)
  }

  if (input.threadRootAuthorUserId) {
    recipients.add(input.threadRootAuthorUserId)
  }

  recipients.delete(input.actorUserId)

  return [...recipients]
}
async function assertCanCollaborateOnCase(
  tx: DB,
  renewalCase: {
    assignedToUserId: string | null
  },
  actorUserId: string,
) {
  const actorRoles = await tx
    .select({
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, actorUserId), eq(userRoles.isActive, true)))

  const roleNames = new Set(actorRoles.map((row) => row.roleName))

  const isOversightUser =
    roleNames.has('HR_ADMIN') || roleNames.has('HR_DIRECTOR')

  const isAssignedGovernmentRelationsUser =
    roleNames.has(GOVERNMENT_RELATIONS_ROLE) &&
    renewalCase.assignedToUserId === actorUserId

  // if (!isOversightUser && !isAssignedGovernmentRelationsUser) {
  //   throw new IqamaRenewalProcessError(
  //     'You are not allowed to participate in this case discussion.',
  //     403,
  //     'IQAMA_RENEWAL_COMMENT_FORBIDDEN',
  //   )
  // }
}

async function createCommentNotification(
  tx: DB,
  input: CreateCommentNotificationInput,
) {
  if (!input.recipientUserIds.length) {
    return null
  }

  const activityType = input.isReply ? 'reply' : 'comment'

  const event = await NotificationRepository.reserveEventIfNotExists(tx, {
    sourceType: IQAMA_COMMENT_SOURCE_TYPE,
    sourceId: input.commentId,
    milestone: IQAMA_COMMENT_NOTIFICATION_MILESTONES[activityType],
  })

  if (!event) {
    return null
  }

  const employeeLabel = input.employeeName || input.employeeNumber || 'employee'

  const preview =
    input.body.length > 140 ? `${input.body.slice(0, 137)}...` : input.body

  const notification = await NotificationRepository.createNotification(tx, {
    employeeId: input.employeeId,
    type: IQAMA_COMMENT_NOTIFICATION_TYPES[activityType],

    title: input.isReply
      ? `New reply in ${employeeLabel}'s Iqama case`
      : `New comment on ${employeeLabel}'s Iqama case`,

    message: preview,
    sourceType: IQAMA_COMMENT_SOURCE_TYPE,
    sourceId: input.commentId,
    severity: 'info',

    metadata: {
      iqamaRenewalCaseId: input.caseId,
      iqamaRenewalCommentId: input.commentId,
      parentCommentId: input.parentCommentId,
      threadRootId: input.threadRootId,
      activityType,
      action: 'open_iqama_renewal_discussion',
      employeeNumber: input.employeeNumber,
    },
  })

  if (!notification) {
    throw new IqamaRenewalProcessError(
      'Unable to create comment notification.',
      500,
      'COMMENT_NOTIFICATION_FAILED',
    )
  }

  await NotificationRepository.attachNotificationToEvent(tx, {
    eventId: event.id,
    notificationId: notification.id,
  })

  await NotificationRepository.addRecipients(
    tx,
    notification.id,
    input.recipientUserIds,
  )

  return notification
}

async function createCaseCommentActivity(
  tx: DB,
  input: CreateCommentActivityInput,
) {
  const body = input.body.trim()

  if (!body) {
    throw new IqamaRenewalProcessError(
      'Comment is required.',
      422,
      'COMMENT_REQUIRED',
    )
  }

  let parentComment: Awaited<
    ReturnType<typeof IqamaRenewalCaseCommentRepository.findByIdInCase>
  > | null = null

  let threadRoot: Awaited<
    ReturnType<typeof IqamaRenewalCaseCommentRepository.findByIdInCase>
  > | null = null

  if (input.parentCommentId) {
    parentComment = await IqamaRenewalCaseCommentRepository.findByIdInCase(
      tx,
      input.renewalCase.id,
      input.parentCommentId,
    )

    if (!parentComment) {
      throw new IqamaRenewalProcessError(
        'The comment being replied to was not found.',
        404,
        'PARENT_COMMENT_NOT_FOUND',
      )
    }

    const threadRootId = parentComment.threadRootId ?? parentComment.id

    threadRoot = await IqamaRenewalCaseCommentRepository.findByIdInCase(
      tx,
      input.renewalCase.id,
      threadRootId,
    )

    if (!threadRoot) {
      throw new IqamaRenewalProcessError(
        'The discussion thread was not found.',
        409,
        'COMMENT_THREAD_NOT_FOUND',
      )
    }

    if (threadRoot.parentCommentId) {
      throw new IqamaRenewalProcessError(
        'The discussion thread is invalid.',
        409,
        'INVALID_COMMENT_THREAD',
      )
    }
  }

  const created = await IqamaRenewalCaseCommentRepository.create(tx, {
    caseId: input.renewalCase.id,
    authorUserId: input.actorUserId,
    body,
    statusAtTime: input.renewalCase.status,
    parentCommentId: parentComment?.id ?? null,
    threadRootId: threadRoot?.id ?? null,
  })

  if (!created) {
    throw new IqamaRenewalProcessError(
      'Unable to create comment.',
      500,
      'COMMENT_CREATE_FAILED',
    )
  }

  const recipientUserIds = await resolveCommentNotificationRecipients(tx, {
    caseId: input.renewalCase.id,
    actorUserId: input.actorUserId,
    assignedToUserId: input.renewalCase.assignedToUserId,
    caseCreatedBy: input.renewalCase.createdBy ?? null,
    parentAuthorUserId: parentComment?.authorUserId ?? null,
    threadRootAuthorUserId: threadRoot?.authorUserId ?? null,
  })

  const employeeName =
    input.renewalCase.employeeNameEn?.trim() ||
    input.renewalCase.employeeNameAr?.trim() ||
    null

  await createCommentNotification(tx, {
    commentId: created.id,
    caseId: input.renewalCase.id,
    employeeId: input.renewalCase.employeeId,
    employeeNumber: input.renewalCase.employeeNumber ?? null,
    employeeName,
    body: created.body,
    isReply: created.parentCommentId !== null,
    parentCommentId: created.parentCommentId,
    threadRootId: created.threadRootId,
    recipientUserIds,
  })

  return created
}

export const IqamaRenewalCaseCommentService = {
  list: async (caseId: string, actor: IqamaRenewalCaseActor) => {
    return db.transaction(async (tx) => {
      const renewalCase = await IqamaRenewalProcessRepository.findById(
        tx,
        caseId,
      )

      if (!renewalCase) {
        throw new IqamaRenewalProcessError(
          'Iqama renewal case was not found.',
          404,
          'IQAMA_RENEWAL_CASE_NOT_FOUND',
        )
      }

      await assertCanCollaborateOnCase(tx, renewalCase, actor.userId)

      return IqamaRenewalCaseCommentRepository.listByCaseId(tx, caseId)
    })
  },

  addComment: async (
    caseId: string,
    input: CreateIqamaRenewalCommentInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const renewalCase = await IqamaRenewalProcessRepository.findById(
        tx,
        caseId,
      )

      if (!renewalCase) {
        throw new IqamaRenewalProcessError(
          'Iqama renewal case was not found.',
          404,
          'IQAMA_RENEWAL_CASE_NOT_FOUND',
        )
      }

      await assertCanCollaborateOnCase(tx, renewalCase, actor.userId)

      return createCaseCommentActivity(tx, {
        renewalCase,
        actorUserId: actor.userId,
        body: input.body,
      })
    })
  },

  replyToComment: async (
    caseId: string,
    parentCommentId: string,
    input: CreateIqamaRenewalCommentInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const renewalCase = await IqamaRenewalProcessRepository.findById(
        tx,
        caseId,
      )

      if (!renewalCase) {
        throw new IqamaRenewalProcessError(
          'Iqama renewal case was not found.',
          404,
          'IQAMA_RENEWAL_CASE_NOT_FOUND',
        )
      }

      await assertCanCollaborateOnCase(tx, renewalCase, actor.userId)

      return createCaseCommentActivity(tx, {
        renewalCase,
        actorUserId: actor.userId,
        body: input.body,
        parentCommentId,
      })
    })
  },

  /*
   * Called by the workflow service when it already owns a transaction.
   * This method must not start another transaction.
   */
  createWithinTransaction: async (
    tx: DB,
    input: CreateCommentActivityInput,
  ) => {
    return createCaseCommentActivity(tx, input)
  },
}
