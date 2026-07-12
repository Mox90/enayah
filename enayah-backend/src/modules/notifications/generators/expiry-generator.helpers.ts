// src/modules/notifications/generators/expiry-generator.helpers.ts

import { DB } from '../../../db'
import { NotificationRepository } from '../repository/notification.repository'

export const EXPIRY_MILESTONES = [
  { key: '90d', days: 90 },
  { key: '60d', days: 60 },
  { key: '30d', days: 30 },
  { key: '14d', days: 14 },
  { key: '7d', days: 7 },
] as const

export type ExpiryMilestone =
  | (typeof EXPIRY_MILESTONES)[number]
  | {
      key: 'expired'
      days: number
    }

export function calculateDaysUntil(expiryDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const diffMs = expiry.getTime() - today.getTime()

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// export async function getNextDueMilestone(
//   tx: DB,
//   sourceType: string,
//   sourceId: string,
//   expiryDate: string,
// ): Promise<ExpiryMilestone | null> {
//   const daysUntil = calculateDaysUntil(expiryDate)

//   if (daysUntil < 0) {
//     const alreadyNotified = await NotificationRepository.hasEvent(tx, {
//       sourceType,
//       sourceId,
//       milestone: 'expired',
//     })

//     return alreadyNotified ? null : { key: 'expired', days: daysUntil }
//   }

//   const dueMilestones = EXPIRY_MILESTONES.filter(
//     (milestone) => daysUntil <= milestone.days,
//   ).sort((a, b) => a.days - b.days)

//   for (const milestone of dueMilestones) {
//     const alreadyNotified = await NotificationRepository.hasEvent(tx, {
//       sourceType,
//       sourceId,
//       milestone: milestone.key,
//     })

//     if (!alreadyNotified) {
//       return milestone
//     }
//   }

//   return null
// }

export async function getNextDueMilestone(
  tx: DB,
  sourceType: string,
  sourceId: string,
  expiryDate: string,
): Promise<ExpiryMilestone | null> {
  const daysUntil = calculateDaysUntil(expiryDate)

  if (daysUntil < 0) {
    const alreadyNotified = await NotificationRepository.hasEvent(tx, {
      sourceType,
      sourceId,
      milestone: 'expired',
    })

    return alreadyNotified ? null : { key: 'expired', days: daysUntil }
  }

  const dueMilestone = EXPIRY_MILESTONES.filter(
    (milestone) => daysUntil <= milestone.days,
  ).sort((a, b) => a.days - b.days)[0]

  if (!dueMilestone) return null

  const alreadyNotified = await NotificationRepository.hasEvent(tx, {
    sourceType,
    sourceId,
    milestone: dueMilestone.key,
  })

  return alreadyNotified ? null : dueMilestone
}

export function getSeverity(
  milestoneKey: string,
  days: number,
): 'info' | 'warning' | 'success' | 'error' {
  if (milestoneKey === 'expired') return 'error'
  if (days <= 14) return 'warning'

  return 'info'
}
