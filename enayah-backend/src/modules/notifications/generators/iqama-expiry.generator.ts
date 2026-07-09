// src/modules/notifications/generators/iqama-expiry.generator.ts

import { and, eq, isNotNull } from 'drizzle-orm'

import {
  db,
  employeeIdentifications,
  employees,
  roles,
  userRoles,
  users,
} from '../../../db'

import { NotificationRepository } from '../repository/notification.repository'
import { getNextDueMilestone, getSeverity } from './expiry-generator.helpers'

export const IqamaExpiryGenerator = {
  run: async () => {
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

        const sourceType = 'employee_identification'
        const sourceId = iqama.identificationId

        const milestone = await getNextDueMilestone(
          tx,
          sourceType,
          sourceId,
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
            sourceType,
            sourceId,
            dueDate: iqama.expiryDate,
            severity: getSeverity(milestone.key, milestone.days),
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
          sourceType,
          sourceId,
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
