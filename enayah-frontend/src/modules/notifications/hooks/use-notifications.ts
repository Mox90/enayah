// src/modules/notifications/hooks/use-notifications.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notification.service'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.mine,
    refetchInterval: 5_000, //60_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useArchiveNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
