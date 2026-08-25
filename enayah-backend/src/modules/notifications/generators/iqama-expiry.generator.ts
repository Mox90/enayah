// src/modules/notifications/generators/iqama-expiry.generator.ts

import { and, eq, exists, isNotNull } from 'drizzle-orm'

import {
  db,
  employeeIdentifications,
  employees,
  employments,
  roles,
  userRoles,
  users,
} from '../../../db'

import { NotificationRepository } from '../repository/notification.repository'
import { getNextDueMilestone, getSeverity } from './expiry-generator.helpers'
import { hasActiveEmployment } from '../utils/expiry-generator.helpers'

const formatArabicDays = (days: number) => {
  if (days === 1) {
    return 'يوم واحد'
  }

  if (days === 2) {
    return 'يومين'
  }

  if (days >= 3 && days <= 10) {
    return `${days} أيام`
  }

  return `${days} يومًا`
}

export const IqamaExpiryGenerator = {
  run: async () => {
    return db.transaction(async (tx) => {
      /*
       * Recipients:
       * All users having the HR_ADMIN role.
       */
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

      /*
       * Only retrieve current Iqamas belonging to employees
       * who currently have an ACTIVE employment.
       *
       * EXISTS is intentionally used instead of joining
       * employments because we only care whether an active
       * employment exists.
       */
      const iqamas = await tx
        .select({
          identificationId: employeeIdentifications.id,
          employeeId: employees.id,
          employeeNumber: employees.employeeNumber,
          firstNameEn: employees.firstNameEn,
          familyNameEn: employees.familyNameEn,
          firstNameAr: employees.firstNameAr,
          familyNameAr: employees.familyNameAr,
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
            hasActiveEmployment(tx),
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

        /*
         * Create/reuse the Iqama renewal case only after
         * we know:
         *
         * 1. employee is active
         * 2. Iqama is current
         * 3. milestone is due
         */
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

        const employeeName = [iqama.firstNameEn, iqama.familyNameEn]
          .filter(Boolean)
          .join(' ')
          .trim()

        /*
         * Prefer the employee's Arabic name.
         *
         * Fall back to the English name if Arabic data
         * is unavailable.
         */
        const employeeNameAr =
          [iqama.firstNameAr, iqama.familyNameAr]
            .filter(Boolean)
            .join(' ')
            .trim() || employeeName

        /*
         * Atomically reserve the notification milestone.
         *
         * If another generator/process already reserved it,
         * no duplicate notification is created.
         */
        const event = await NotificationRepository.reserveEventIfNotExists(tx, {
          sourceType,
          sourceId,
          milestone: milestone.key,
        })

        if (!event) {
          skipped++
          continue
        }

        const isExpired = milestone.key === 'expired'

        const notification = await NotificationRepository.createNotification(
          tx,
          {
            employeeId: iqama.employeeId,

            type: 'iqama_expiry',

            /*
             * English
             */
            title: isExpired
              ? `Iqama expired: ${employeeName}`
              : `Iqama expires in ${milestone.days} days`,

            message: isExpired
              ? `${employeeName}'s Iqama expired on ${iqama.expiryDate}. HR must start urgent action and review EOC risk.`
              : `${employeeName}'s Iqama will expire on ${iqama.expiryDate}. Please start the MHRSD upload and renewal procedure.`,

            /*
             * Arabic
             */
            titleAr: isExpired
              ? `انتهاء صلاحية الإقامة: ${employeeNameAr}`
              : `تنتهي صلاحية الإقامة خلال ${formatArabicDays(milestone.days)}`,

            messageAr: isExpired
              ? `انتهت صلاحية إقامة ${employeeNameAr} بتاريخ ${iqama.expiryDate}. يجب على الموارد البشرية اتخاذ إجراء عاجل ومراجعة مخاطر إنهاء الخدمة.`
              : `ستنتهي صلاحية إقامة ${employeeNameAr} بتاريخ ${iqama.expiryDate}. يرجى البدء في رفع البيانات إلى وزارة الموارد البشرية والتنمية الاجتماعية وإجراءات تجديد الإقامة.`,

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

        await NotificationRepository.attachNotificationToEvent(tx, {
          eventId: event.id,
          notificationId: notification.id,
        })

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
