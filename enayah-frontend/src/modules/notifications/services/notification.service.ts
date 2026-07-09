// src/modules/notifications/services/notification.service.ts

import { api } from '@/lib/api/client'

export type NotificationItem = {
  id: string
  notificationId: string
  recipientUserId: string
  isRead: boolean
  isArchived: boolean
  createdAt: string
  notification: {
    id: string
    type: string
    title: string
    message: string
    dueDate?: string | null
    severity: 'info' | 'warning' | 'success' | 'error'
    metadata?: unknown
  }
}

export const notificationService = {
  mine: async () => {
    const res = await api.get('/notifications')
    return res.data as NotificationItem[]
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data
  },

  archive: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/archive`)
    return res.data
  },
}
