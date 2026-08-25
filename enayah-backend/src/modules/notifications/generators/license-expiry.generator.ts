// src/modules/notifications/generators/license-expiry.generator.ts

import { and, eq, isNotNull } from 'drizzle-orm'

import {
  db,
  employeeLicenses,
  employees,
  roles,
  userRoles,
  users,
} from '../../../db'

import { NotificationRepository } from '../repository/notification.repository'
import { hasActiveEmployment } from '../utils/expiry-generator.helpers'

import { getNextDueMilestone, getSeverity } from './expiry-generator.helpers'

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

export const LicenseExpiryGenerator = {
  run: async () => {
    return db.transaction(async (tx) => {
      /*
       * Retrieve current license only for:
       *
       * 1. Active employees
       * 2. Non-deleted employees
       * 3. Non-deleted licenses
       * 4. Licenses with an expiry date
       * 5. Employees having a user account with EMPLOYEE role
       *
       * recipientUserId belongs specifically to that employee.
       * Each license is handled independently using its own license ID.
       */
      const licenses = await tx
        .select({
          licenseId: employeeLicenses.id,
          employeeId: employees.id,
          employeeNumber: employees.employeeNumber,
          authority: employeeLicenses.authority,
          licenseNumber: employeeLicenses.licenseNumber,
          profession: employeeLicenses.profession,
          status: employeeLicenses.status,
          recipientUserId: users.id,
          expiryDate: employeeLicenses.expiryDate,
          documentFileId: employeeLicenses.documentFileId,
        })
        .from(employeeLicenses)
        .innerJoin(employees, eq(employees.id, employeeLicenses.employeeId))
        .innerJoin(users, eq(users.employeeId, employees.id))
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          and(
            eq(employeeLicenses.isDeleted, false),
            eq(employees.isDeleted, false),
            eq(roles.name, 'EMPLOYEE'),
            isNotNull(employeeLicenses.expiryDate),
            hasActiveEmployment(tx),
          ),
        )

      let created = 0
      let skipped = 0

      for (const license of licenses) {
        if (!license.expiryDate) {
          skipped++
          continue
        }

        const sourceType = 'employee_license'
        const sourceId = license.licenseId

        /*
         * Determine whether a notification milestone is
         * currently due: 90, 60, 30, 14, 7, expired, etc.
         */
        const milestone = await getNextDueMilestone(
          tx,
          sourceType,
          sourceId,
          license.expiryDate,
        )

        if (!milestone) {
          skipped++
          continue
        }

        /*
         * Atomically reserve this milestone so repeated
         * generator runs cannot produce duplicate alerts.
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
            employeeId: license.employeeId,
            type: 'license_expiry',
            /*
             * English
             */
            title: isExpired
              ? `${license.authority} license ${license.licenseNumber} has expired`
              : `${license.authority} license ${license.licenseNumber} expires in ${milestone.days} days`,
            message: isExpired
              ? `Your ${license.authority} license (${license.licenseNumber}) expired on ${license.expiryDate}. Please arrange its renewal and provide the updated license information to HR.`
              : `Your ${license.authority} license (${license.licenseNumber}) will expire on ${license.expiryDate}. Please arrange its renewal and provide the updated license information to HR.`,
            /*
             * Arabic
             */

            titleAr: isExpired
              ? `انتهت صلاحية الرخصة رقم ${license.licenseNumber} الصادرة من ${license.authority}`
              : `ستنتهي صلاحية الرخصة رقم ${license.licenseNumber} الصادرة من ${license.authority} خلال ${formatArabicDays(milestone.days)}`,

            messageAr: isExpired
              ? `انتهت صلاحية الرخصة رقم ${license.licenseNumber} الصادرة من ${license.authority} بتاريخ ${license.expiryDate}. يرجى اتخاذ اللازم لتجديدها وتزويد الموارد البشرية ببيانات الرخصة المحدثة.`
              : `ستنتهي صلاحية الرخصة رقم ${license.licenseNumber} الصادرة من ${license.authority} بتاريخ ${license.expiryDate}. يرجى اتخاذ اللازم لتجديدها وتزويد الموارد البشرية ببيانات الرخصة المحدثة.`,
            sourceType,
            sourceId,
            dueDate: license.expiryDate,
            severity: getSeverity(milestone.key, milestone.days),
            metadata: {
              documentType: 'license',
              employeeNumber: license.employeeNumber,
              milestone: milestone.key,
              licenseId: license.licenseId,
              licenseNumber: license.licenseNumber,
              authority: license.authority,
              profession: license.profession,
              documentFileId: license.documentFileId,
              status: license.status,
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

        /*
         * License notification goes ONLY to the user
         * account belonging to this employee.
         */
        await NotificationRepository.addRecipients(tx, notification.id, [
          license.recipientUserId,
        ])

        created++
      }

      return {
        created,
        skipped,
      }
    })
  },
}
