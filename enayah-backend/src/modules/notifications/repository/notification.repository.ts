// src/modules/notifications/repository/notification.repository.ts

import { and, desc, eq } from 'drizzle-orm'
import {
  DB,
  notifications,
  notificationRecipients,
  notificationEvents,
  iqamaRenewalCases,
} from '../../../db'

export const NotificationRepository = {
  createNotification: async (
    tx: DB,
    data: {
      employeeId?: string | null
      type: string
      title: string
      message: string
      sourceType: string
      sourceId: string
      dueDate?: string | null
      severity: 'info' | 'warning' | 'success' | 'error'
      metadata?: unknown
    },
  ) => {
    const [created] = await tx
      .insert(notifications)
      .values({
        employeeId: data.employeeId ?? null,
        type: data.type,
        title: data.title,
        message: data.message,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        dueDate: data.dueDate ?? null,
        severity: data.severity,
        metadata: data.metadata,
      })
      .returning()

    return created
  },

  createEventIfNotExists: async (
    tx: DB,
    data: {
      sourceType: string
      sourceId: string
      milestone: string
      notificationId: string
    },
  ) => {
    const [created] = await tx
      .insert(notificationEvents)
      .values(data)
      .onConflictDoNothing()
      .returning()

    return created ?? null
  },

  addRecipients: async (
    tx: DB,
    notificationId: string,
    recipientUserIds: string[],
  ) => {
    if (!recipientUserIds.length) return []

    return tx
      .insert(notificationRecipients)
      .values(
        recipientUserIds.map((recipientUserId) => ({
          notificationId,
          recipientUserId,
        })),
      )
      .returning()
  },

  findMyNotifications: async (tx: DB, userId: string) => {
    return tx.query.notificationRecipients.findMany({
      where: and(
        eq(notificationRecipients.recipientUserId, userId),
        eq(notificationRecipients.isArchived, false),
      ),
      orderBy: [desc(notificationRecipients.createdAt)],
      with: {
        notification: true,
      },
    })
  },

  markAsRead: async (tx: DB, id: string, userId: string) => {
    const [updated] = await tx
      .update(notificationRecipients)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationRecipients.id, id),
          eq(notificationRecipients.recipientUserId, userId),
        ),
      )
      .returning()

    return updated
  },

  archive: async (tx: DB, id: string, userId: string) => {
    const [updated] = await tx
      .update(notificationRecipients)
      .set({
        isArchived: true,
      })
      .where(
        and(
          eq(notificationRecipients.id, id),
          eq(notificationRecipients.recipientUserId, userId),
        ),
      )
      .returning()

    return updated
  },

  findOrCreateIqamaCase: async (
    tx: DB,
    data: {
      employeeId: string
      identificationId: string
    },
  ) => {
    const existing = await tx.query.iqamaRenewalCases.findFirst({
      where: eq(iqamaRenewalCases.identificationId, data.identificationId),
    })

    if (existing) return existing

    const [created] = await tx
      .insert(iqamaRenewalCases)
      .values({
        employeeId: data.employeeId,
        identificationId: data.identificationId,
        status: 'pending_upload',
      })
      .returning()

    return created
  },
}
