// src/modules/notifications/services/notification.service.ts

import { api } from '@/lib/api/client'

type NotificationSeverity = 'info' | 'warning' | 'success' | 'error'

type NotificationActivityType =
  | 'assigned_to_government_relations'
  | 'completed_by_government_relations'
  | 'returned_to_hr'

type NotificationMetadata = {
  documentType?: string
  employeeNumber?: string | null
  employeeId?: string
  milestone?: string
  iqamaRenewalCaseId?: string

  action?: 'open_iqama_renewal_case'

  activityType?: NotificationActivityType
}

export type NotificationItem = {
  id: string
  notificationId: string
  recipientUserId: string

  isRead: boolean
  readAt: string | null
  isArchived: boolean
  createdAt: string

  notification: {
    id: string
    employeeId: string | null

    type: string
    title: string
    message: string

    sourceType: string
    sourceId: string

    dueDate: string | null
    severity: NotificationSeverity //'info' | 'warning' | 'success' | 'error'

    metadata: NotificationMetadata | null
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
