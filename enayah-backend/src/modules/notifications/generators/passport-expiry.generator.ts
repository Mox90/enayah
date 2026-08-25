// src/modules/notifications/generators/passport-expiry.generator.ts

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

export const PassportExpiryGenerator = {
  run: async () => {
    return db.transaction(async (tx) => {
      /*
       * Retrieve current passports only for:
       *
       * 1. Active employees
       * 2. Non-deleted employees
       * 3. Current/non-deleted passports
       * 4. Passports with an expiry date
       * 5. Employees having a user account with EMPLOYEE role
       *
       * recipientUserId belongs specifically to that employee.
       */
      const passports = await tx
        .select({
          identificationId: employeeIdentifications.id,
          employeeId: employees.id,
          employeeNumber: employees.employeeNumber,
          recipientUserId: users.id,
          expiryDate: employeeIdentifications.expiryDate,
        })
        .from(employeeIdentifications)
        .innerJoin(
          employees,
          eq(employees.id, employeeIdentifications.employeeId),
        )
        .innerJoin(users, eq(users.employeeId, employees.id))
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          and(
            eq(employeeIdentifications.type, 'passport'),
            eq(employeeIdentifications.isCurrent, true),
            eq(employeeIdentifications.isDeleted, false),
            eq(employees.isDeleted, false),
            eq(roles.name, 'EMPLOYEE'),
            isNotNull(employeeIdentifications.expiryDate),
            hasActiveEmployment(tx),
          ),
        )

      let created = 0
      let skipped = 0

      for (const passport of passports) {
        if (!passport.expiryDate) {
          skipped++
          continue
        }

        const sourceType = 'employee_identification'
        const sourceId = passport.identificationId

        /*
         * Determine whether a notification milestone is
         * currently due: 90, 60, 30, 14, 7, expired, etc.
         */
        const milestone = await getNextDueMilestone(
          tx,
          sourceType,
          sourceId,
          passport.expiryDate,
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
            employeeId: passport.employeeId,
            type: 'passport_expiry',
            /*
             * English
             */
            title: isExpired
              ? 'Your passport has expired'
              : `Your passport expires in ${milestone.days} days`,
            message: isExpired
              ? `Your passport expired on ${passport.expiryDate}. Please arrange its renewal and provide your updated passport information to HR.`
              : `Your passport will expire on ${passport.expiryDate}. Please arrange its renewal and provide your updated passport information to HR.`,
            /*
             * Arabic
             */
            titleAr: isExpired
              ? 'انتهت صلاحية جواز سفرك'
              : `ستنتهي صلاحية جواز سفرك خلال ${formatArabicDays(
                  milestone.days,
                )}`,
            messageAr: isExpired
              ? `انتهت صلاحية جواز سفرك بتاريخ ${passport.expiryDate}. يرجى اتخاذ اللازم لتجديده وتزويد الموارد البشرية ببيانات جواز السفر المحدثة.`
              : `ستنتهي صلاحية جواز سفرك بتاريخ ${passport.expiryDate}. يرجى اتخاذ اللازم لتجديده وتزويد الموارد البشرية ببيانات جواز السفر المحدثة.`,
            sourceType,
            sourceId,
            dueDate: passport.expiryDate,
            severity: getSeverity(milestone.key, milestone.days),
            metadata: {
              documentType: 'passport',
              employeeNumber: passport.employeeNumber,
              milestone: milestone.key,
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
         * Passport notification goes ONLY to the user
         * account belonging to this employee.
         */
        await NotificationRepository.addRecipients(tx, notification.id, [
          passport.recipientUserId,
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
