// src/modules/notifications/service/notification-generator.service.ts

import { and, eq, isNotNull } from 'drizzle-orm'
import {
  db,
  employeeIdentifications,
  employees,
  users,
  userRoles,
  roles,
  DB,
} from '../../../db'
import { NotificationRepository } from '../repository/notification.repository'

const EXPIRY_MILESTONES = [
  { key: '90d', days: 90 },
  { key: '60d', days: 60 },
  { key: '30d', days: 30 },
  { key: '14d', days: 14 },
  { key: '7d', days: 7 },
] as const

function calculateDaysUntil(expiryDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const diffMs = expiry.getTime() - today.getTime()

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

async function getNextDueMilestone(
  tx: DB,
  sourceType: string,
  sourceId: string,
  expiryDate: string,
) {
  const daysUntil = calculateDaysUntil(expiryDate)

  if (daysUntil < 0) {
    const alreadyNotified = await NotificationRepository.hasEvent(tx, {
      sourceType,
      sourceId,
      milestone: 'expired',
    })

    return alreadyNotified ? null : { key: 'expired', days: daysUntil }
  }

  const dueMilestones = EXPIRY_MILESTONES.filter(
    (milestone) => daysUntil <= milestone.days,
  ).sort((a, b) => a.days - b.days)

  for (const milestone of dueMilestones) {
    const alreadyNotified = await NotificationRepository.hasEvent(tx, {
      sourceType,
      sourceId,
      milestone: milestone.key,
    })

    if (!alreadyNotified) {
      return milestone
    }
  }

  return null
}

function getSeverity(milestoneKey: string, days: number) {
  if (milestoneKey === 'expired') return 'error'
  if (days <= 14) return 'warning'
  return 'info'
}

export const NotificationGeneratorService = {
  generateIqamaExpiryAlerts: async () => {
    return db.transaction(async (tx) => {
      const hrAdmins = await tx
        .select({
          userId: users.id,
        })
        .from(users)
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(eq(roles.name, 'HR_ADMIN'))

      const recipientUserIds = hrAdmins.map((row) => row.userId)

      if (!recipientUserIds.length) {
        return {
          created: 0,
          skipped: 0,
          message: 'No HR_ADMIN users found.',
        }
      }

      const iqamas = await tx
        .select({
          identificationId: employeeIdentifications.id,
          employeeId: employees.id,
          employeeNumber: employees.employeeNumber,
          firstNameEn: employees.firstNameEn,
          familyNameEn: employees.familyNameEn,
          expiryDate: employeeIdentifications.expiryDate,
        })
        .from(employeeIdentifications)
        .innerJoin(
          employees,
          eq(employees.id, employeeIdentifications.employeeId),
        )
        .where(
          and(
            eq(employeeIdentifications.type, 'iqama'),
            eq(employeeIdentifications.isCurrent, true),
            eq(employeeIdentifications.isDeleted, false),
            eq(employees.isDeleted, false),
            isNotNull(employeeIdentifications.expiryDate),
          ),
        )

      let created = 0
      let skipped = 0

      for (const iqama of iqamas) {
        if (!iqama.expiryDate) {
          skipped++
          continue
        }

        const milestone = await getNextDueMilestone(
          tx,
          'employee_identification',
          iqama.identificationId,
          iqama.expiryDate,
        )

        if (!milestone) {
          skipped++
          continue
        }

        const iqamaCase = await NotificationRepository.findOrCreateIqamaCase(
          tx,
          {
            employeeId: iqama.employeeId,
            identificationId: iqama.identificationId,
          },
        )

        if (!iqamaCase) {
          skipped++
          continue
        }

        const employeeName = `${iqama.firstNameEn} ${iqama.familyNameEn}`

        const notification = await NotificationRepository.createNotification(
          tx,
          {
            employeeId: iqama.employeeId,
            type: 'iqama_expiry',
            title:
              milestone.key === 'expired'
                ? `Iqama expired: ${employeeName}`
                : `Iqama expires in ${milestone.days} days`,
            message:
              milestone.key === 'expired'
                ? `${employeeName}'s Iqama expired on ${iqama.expiryDate}. HR must start urgent action and review EOC risk.`
                : `${employeeName}'s Iqama will expire on ${iqama.expiryDate}. Please start the MHRSD upload and renewal procedure.`,
            sourceType: 'employee_identification',
            sourceId: iqama.identificationId,
            dueDate: iqama.expiryDate,
            severity: getSeverity(milestone.key, milestone.days) as
              | 'info'
              | 'warning'
              | 'success'
              | 'error',
            metadata: {
              documentType: 'iqama',
              employeeNumber: iqama.employeeNumber,
              milestone: milestone.key,
              iqamaRenewalCaseId: iqamaCase.id,
            },
          },
        )

        if (!notification) {
          skipped++
          continue
        }

        const event = await NotificationRepository.createEventIfNotExists(tx, {
          sourceType: 'employee_identification',
          sourceId: iqama.identificationId,
          milestone: milestone.key,
          notificationId: notification.id,
        })

        if (!event) {
          skipped++
          continue
        }

        await NotificationRepository.addRecipients(
          tx,
          notification.id,
          recipientUserIds,
        )

        created++
      }

      return {
        created,
        skipped,
      }
    })
  },
}
