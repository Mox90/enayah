// src/modules/notifications/generators/life-support-expiry.generator.ts

import { and, eq, isNotNull } from 'drizzle-orm'

import {
  db,
  employeeLifeSupportCertifications,
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

/*

export const lifeSupportTypeEnum = pgEnum('life_support_type', [
  'bls', // Basic Life Support
  'acls', // Advanced Cardiovascular Life Support
  'pals', // Pediatric Advanced Life Support
  'atls', // Advanced Trauma Life Support
  'stls', // Saudi Trauma Life Support
  'nrp', // Neonatal Resuscitation Program
  'itls', // International Trauma Life Support
  'blso', // Basic Life Support in Obstetrics
  'atcn', // Advanced Trauma Care for Nurses
  'also', // Advanced Life Support in Obstetrics
  'tncc', // Trauma Nursing Core Course
  'enpc', // Emergency Nursing Pediatric Course
  'asls', // Advanced Stroke Life Support
  'esls', // Essential Stroke Life Support
  'pfccs', // Pediatric Fundamental Critical Care Support
  'other',
])


*/

const formatLifeSupportType = (type: string) => {
  switch (type) {
    case 'bls':
      return 'BLS'
    case 'acls':
      return 'ACLS'
    case 'pals':
      return 'PALS'
    case 'nrp':
      return 'NRP'
    default:
      return type
  }
}

export const LifeSupportExpiryGenerator = {
  run: async () => {
    return db.transaction(async (tx) => {
      /*
       * Retrieve current license only for:
       *
       * 1. Active employees
       * 2. Non-deleted employees
       * 3. Non-deleted life support
       * 4. Life Support with an expiry date
       * 5. Employees having a user account with EMPLOYEE role
       *
       * recipientUserId belongs specifically to that employee.
       * Each Life support is handled independently using its own life support ID.
       */
      const lifeSupports = await tx
        .select({
          lifeSupportId: employeeLifeSupportCertifications.id,
          employeeId: employees.id,
          employeeNumber: employees.employeeNumber,
          type: employeeLifeSupportCertifications.type,
          provider: employeeLifeSupportCertifications.provider,
          certificateNumber:
            employeeLifeSupportCertifications.certificateNumber,
          recipientUserId: users.id,
          expiryDate: employeeLifeSupportCertifications.expiryDate,
          documentFileId: employeeLifeSupportCertifications.documentFileId,
        })
        .from(employeeLifeSupportCertifications)
        .innerJoin(
          employees,
          eq(employees.id, employeeLifeSupportCertifications.employeeId),
        )
        .innerJoin(users, eq(users.employeeId, employees.id))
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          and(
            eq(employeeLifeSupportCertifications.isDeleted, false),
            eq(employees.isDeleted, false),
            eq(roles.name, 'EMPLOYEE'),
            isNotNull(employeeLifeSupportCertifications.expiryDate),
            hasActiveEmployment(tx),
          ),
        )

      let created = 0
      let skipped = 0

      for (const lifeSupport of lifeSupports) {
        if (!lifeSupport.expiryDate) {
          skipped++
          continue
        }

        const sourceType = 'employee_life_support'
        const sourceId = lifeSupport.lifeSupportId

        /*
         * Determine whether a notification milestone is
         * currently due: 90, 60, 30, 14, 7, expired, etc.
         */
        const milestone = await getNextDueMilestone(
          tx,
          sourceType,
          sourceId,
          lifeSupport.expiryDate,
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

        const certificateType = formatLifeSupportType(lifeSupport.type)

        const notification = await NotificationRepository.createNotification(
          tx,
          {
            employeeId: lifeSupport.employeeId,

            type: 'life_support_expiry',

            /*
             * English
             */
            title: isExpired
              ? `${certificateType} certificate ${lifeSupport.certificateNumber} has expired`
              : `${certificateType} certificate ${lifeSupport.certificateNumber} expires in ${milestone.days} days`,

            message: isExpired
              ? `Your ${certificateType} life-support certificate (${lifeSupport.certificateNumber}) expired on ${lifeSupport.expiryDate}. Please arrange its renewal and provide the updated certificate information to HR.`
              : `Your ${certificateType} life-support certificate (${lifeSupport.certificateNumber}) will expire on ${lifeSupport.expiryDate}. Please arrange its renewal and provide the updated certificate information to HR.`,

            /*
             * Arabic
             */
            titleAr: isExpired
              ? `انتهت صلاحية شهادة ${certificateType} رقم ${lifeSupport.certificateNumber}`
              : `ستنتهي صلاحية شهادة ${certificateType} رقم ${lifeSupport.certificateNumber} خلال ${formatArabicDays(
                  milestone.days,
                )}`,

            messageAr: isExpired
              ? `انتهت صلاحية شهادة دعم الحياة ${certificateType} رقم ${lifeSupport.certificateNumber} بتاريخ ${lifeSupport.expiryDate}. يرجى اتخاذ اللازم لتجديدها وتزويد الموارد البشرية ببيانات الشهادة المحدثة.`
              : `ستنتهي صلاحية شهادة دعم الحياة ${certificateType} رقم ${lifeSupport.certificateNumber} بتاريخ ${lifeSupport.expiryDate}. يرجى اتخاذ اللازم لتجديدها وتزويد الموارد البشرية ببيانات الشهادة المحدثة.`,

            sourceType,
            sourceId,
            dueDate: lifeSupport.expiryDate,
            severity: getSeverity(milestone.key, milestone.days),
            metadata: {
              documentType: 'life_support',
              employeeNumber: lifeSupport.employeeNumber,
              milestone: milestone.key,
              lifeSupportId: lifeSupport.lifeSupportId,
              type: certificateType,
              provider: lifeSupport.provider,
              certificateNumber: lifeSupport.certificateNumber,
              documentFileId: lifeSupport.documentFileId,
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
         * Life support notification goes ONLY to the user
         * account belonging to this employee.
         */
        await NotificationRepository.addRecipients(tx, notification.id, [
          lifeSupport.recipientUserId,
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
