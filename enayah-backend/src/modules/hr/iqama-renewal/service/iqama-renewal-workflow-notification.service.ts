// enayah-backendsrc/modules/hr/iqama-renewal-process/service/iqama-renewal-workflow-notification.service.ts

import { and, eq } from 'drizzle-orm'

import { roles, userRoles, users, type DB } from '../../../../db'

import { NotificationRepository } from '../../../notifications/repository/notification.repository'

import { IqamaRenewalProcessError } from '../types/iqama-renewal-process.types'

import {
  IQAMA_WORKFLOW_NOTIFICATION_MILESTONES,
  IQAMA_WORKFLOW_NOTIFICATION_SOURCE_TYPE,
  IQAMA_WORKFLOW_NOTIFICATION_TYPES,
} from '../constants/iqama-renewal-process.constants'

type WorkflowNotificationCase = {
  id: string
  employeeId: string

  employeeNumber: string | null
  employeeNameEn: string | null
  employeeNameAr: string | null
}

type CreateWorkflowNotificationInput = {
  renewalCase: WorkflowNotificationCase

  actorUserId: string

  recipientUserIds: string[]

  type: string
  milestone: string

  title: string
  message: string

  dueDate: string | null

  activityType:
    | 'assigned_to_government_relations'
    | 'completed_by_government_relations'
}

function getEmployeeLabel(renewalCase: WorkflowNotificationCase) {
  return (
    renewalCase.employeeNameEn?.trim() ||
    renewalCase.employeeNameAr?.trim() ||
    renewalCase.employeeNumber?.trim() ||
    'employee'
  )
}

async function findActiveHrAdminUserIds(tx: DB) {
  return tx
    .selectDistinct({
      userId: users.id,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(roles.name, 'HR_ADMIN'), eq(userRoles.isActive, true)))
}

async function createWorkflowNotification(
  tx: DB,
  input: CreateWorkflowNotificationInput,
) {
  /*
   * Prevent duplicate recipients and avoid
   * sending a notification back to the actor.
   */
  const recipientUserIds = [...new Set(input.recipientUserIds)].filter(
    (userId) => Boolean(userId) && userId !== input.actorUserId,
  )

  if (recipientUserIds.length === 0) {
    return null
  }

  /*
   * Prevent the same workflow milestone from
   * creating duplicate notifications.
   */
  const event = await NotificationRepository.reserveEventIfNotExists(tx, {
    sourceType: IQAMA_WORKFLOW_NOTIFICATION_SOURCE_TYPE,

    sourceId: input.renewalCase.id,

    milestone: input.milestone,
  })

  if (!event) {
    return null
  }

  const notification = await NotificationRepository.createNotification(tx, {
    employeeId: input.renewalCase.employeeId,

    type: input.type,

    title: input.title,

    message: input.message,

    sourceType: IQAMA_WORKFLOW_NOTIFICATION_SOURCE_TYPE,

    /*
     * sourceId points directly to the case.
     */
    sourceId: input.renewalCase.id,

    dueDate: input.dueDate,

    severity: 'info',

    metadata: {
      iqamaRenewalCaseId: input.renewalCase.id,

      employeeId: input.renewalCase.employeeId,

      employeeNumber: input.renewalCase.employeeNumber,

      activityType: input.activityType,

      action: 'open_iqama_renewal_case',
    },
  })

  if (!notification) {
    throw new IqamaRenewalProcessError(
      'Unable to create the Iqama renewal workflow notification.',
      500,
      'IQAMA_WORKFLOW_NOTIFICATION_FAILED',
    )
  }

  await NotificationRepository.attachNotificationToEvent(tx, {
    eventId: event.id,

    notificationId: notification.id,
  })

  await NotificationRepository.addRecipients(
    tx,
    notification.id,
    recipientUserIds,
  )

  return notification
}

export const IqamaRenewalWorkflowNotificationService = {
  /**
   * HR Admin sent the case to an assigned
   * Government Relations user.
   */
  notifyGovernmentRelationsAssignment: async (
    tx: DB,
    input: {
      renewalCase: WorkflowNotificationCase
      actorUserId: string
      assignedToUserId: string
      dueDate: string | null
    },
  ) => {
    const employeeLabel = getEmployeeLabel(input.renewalCase)

    const dueDateMessage = input.dueDate
      ? ` The due date is ${input.dueDate}.`
      : ''

    return createWorkflowNotification(tx, {
      renewalCase: input.renewalCase,

      actorUserId: input.actorUserId,

      recipientUserIds: [input.assignedToUserId],

      type: IQAMA_WORKFLOW_NOTIFICATION_TYPES.assignedToGovernmentRelations,

      milestone:
        IQAMA_WORKFLOW_NOTIFICATION_MILESTONES.assignedToGovernmentRelations,

      title: 'Iqama renewal assigned to you',

      message:
        `${employeeLabel}'s Iqama renewal ` +
        `has been assigned to you for processing.` +
        dueDateMessage,

      dueDate: input.dueDate,

      activityType: 'assigned_to_government_relations',
    })
  },

  /**
   * Government Relations updated the Iqama
   * and completed the workflow.
   */
  notifyHrAdminsOfCompletion: async (
    tx: DB,
    input: {
      renewalCase: WorkflowNotificationCase
      actorUserId: string
    },
  ) => {
    const hrAdminUsers = await findActiveHrAdminUserIds(tx)
    const employeeLabel = getEmployeeLabel(input.renewalCase)
    return createWorkflowNotification(tx, {
      renewalCase: input.renewalCase,
      actorUserId: input.actorUserId,
      recipientUserIds: hrAdminUsers.map((row) => row.userId),
      type: IQAMA_WORKFLOW_NOTIFICATION_TYPES.completedByGovernmentRelations,
      milestone:
        IQAMA_WORKFLOW_NOTIFICATION_MILESTONES.completedByGovernmentRelations,
      title: 'Iqama renewal completed',
      message:
        `${employeeLabel}'s Iqama was updated ` +
        `by Government Relations and the ` +
        `renewal process was completed.`,
      dueDate: null,
      activityType: 'completed_by_government_relations',
    })
  },
}
