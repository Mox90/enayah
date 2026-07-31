// src/modules/notifications/hooks/use-notifications.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notification.service'

export const notificationQueryKeys = {
  all: ['notifications'] as const,

  mine: (userId: string) =>
    [...notificationQueryKeys.all, 'mine', userId] as const,
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: notificationQueryKeys.mine(userId ?? ''),
    queryFn: notificationService.mine,
    enabled: Boolean(userId),
    refetchInterval: userId ? 5_000 : false,
  })
}

export function useMarkNotificationRead(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.markAsRead,

    onSuccess: () => {
      if (!userId) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.mine(userId),
      })
    },
  })
}

export function useArchiveNotification(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.archive,

    onSuccess: () => {
      if (!userId) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.mine(userId),
      })
    },
  })
}
