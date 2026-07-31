// enayah-frontend/src/modules/notifications/components/notification-bell.tsx

'use client'

import { Archive, Bell, ClipboardCheck } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toArabic, toArabicDigits } from '@/utils/utilities'

import {
  useArchiveNotification,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/use-notifications'

import type { NotificationItem } from '../services/notification.service'
import { useState } from 'react'
import { useAuthStore } from '@/modules/iam/stores/auth.store'

const severityClass: Record<string, string> = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
}

/*
 * All notification types that may open an
 * Iqama renewal case.
 *
 * The metadata action check below also supports
 * future workflow notification types.
 */
const IQAMA_CASE_NOTIFICATION_TYPES = new Set<string>([
  /*
   * Original Iqama-expiry notification.
   */
  'iqama_expiry',

  /*
   * HR Admin assigned the case to
   * Government Relations.
   */
  'iqama_renewal_assigned_to_gr',

  /*
   * Government Relations completed the
   * Iqama update.
   */
  'iqama_renewal_completed_by_gr',

  /*
   * Government Relations returned the case
   * to HR.
   */
  'iqama_renewal_returned_to_hr',
])

export function NotificationBell() {
  const router = useRouter()
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')
  const userId = useAuthStore((state) => state.user?.id)
  const { data = [], isLoading, isError } = useNotifications(userId)
  const markRead = useMarkNotificationRead(userId)
  const archive = useArchiveNotification(userId)
  const unreadCount = data.filter((item) => !item.isRead).length
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  /*
   * Reused by:
   *
   * 1. Iqama expiry notification
   * 2. Assigned-to-GR notification
   * 3. Completed-by-GR notification
   * 4. Returned-to-HR notification
   */
  const openIqamaRenewalCase = async (item: NotificationItem) => {
    const rawCaseId = item.notification.metadata?.iqamaRenewalCaseId

    if (typeof rawCaseId !== 'string' || rawCaseId.trim() === '') {
      console.error('Missing iqamaRenewalCaseId:', item.notification.metadata)

      toast.error(
        isRtl
          ? 'لا يحتوي الإشعار على معاملة تجديد إقامة'
          : 'This notification has no Iqama renewal case',
      )

      return
    }

    const caseId = rawCaseId.trim()

    setIsNotificationOpen(false)
    /*
     * Opening the linked case acknowledges
     * the notification, so mark it as read.
     */
    if (!item.isRead) {
      try {
        await markRead.mutateAsync(item.id)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)

        /*
         * Do not prevent navigation merely because
         * the read-state request failed.
         */
      }
    }

    const params = new URLSearchParams({
      view: 'form',
      caseId,
    })

    router.push(`/${locale}/iqama-renewal-process?${params.toString()}`)
  }

  return (
    // <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
    <DropdownMenu
      open={isNotificationOpen}
      onOpenChange={setIsNotificationOpen}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={isRtl ? 'الإشعارات' : 'Notifications'}
          className='relative'
        >
          <Bell className='h-5 w-5' />

          {unreadCount > 0 && (
            <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white'>
              {unreadCount > 99
                ? isRtl
                  ? '٩٩+'
                  : '99+'
                : isRtl
                  ? toArabicDigits(unreadCount)
                  : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-96 p-0'>
        <div className='border-b px-4 py-3'>
          <div className='font-semibold'>
            {isRtl ? 'الإشعارات' : 'Notifications'}
          </div>

          <div className='text-xs text-muted-foreground'>
            {isRtl
              ? `${toArabicDigits(unreadCount)} غير مقروء`
              : `${unreadCount} unread`}
          </div>
        </div>

        <div className='max-h-[420px] overflow-y-auto'>
          {isLoading && (
            <div className='px-4 py-6 text-sm text-muted-foreground'>
              {isRtl ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}
            </div>
          )}

          {isError && (
            <div className='px-4 py-6 text-sm text-muted-foreground'>
              {isRtl
                ? 'تعذر تحميل الإشعارات.'
                : 'Failed to load notifications.'}
            </div>
          )}

          {!isLoading && !isError && data.length === 0 && (
            <div className='px-4 py-6 text-sm text-muted-foreground'>
              {isRtl ? 'لا توجد إشعارات.' : 'No notifications.'}
            </div>
          )}

          {!isLoading &&
            !isError &&
            data.map((item) => {
              const notification = item.notification

              const notificationType = notification.type

              /*
               * Prefer metadata.action because it
               * supports future notification types.
               *
               * The explicit type set maintains
               * compatibility with older notifications.
               */
              const canOpenIqamaCase =
                notification.metadata?.action === 'open_iqama_renewal_case' ||
                IQAMA_CASE_NOTIFICATION_TYPES.has(notificationType)

              const isExpiryNotification = notificationType === 'iqama_expiry'

              return (
                <div
                  key={item.id}
                  className={`border-b px-4 py-3 ${
                    item.isRead ? 'bg-background' : 'bg-muted/40'
                  }`}
                >
                  <div className='flex gap-3'>
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        severityClass[notification.severity] ?? 'bg-slate-400'
                      }`}
                    />

                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='text-sm font-semibold leading-snug'>
                        {notification.title}
                      </div>

                      <p className='line-clamp-2 text-xs text-muted-foreground'>
                        {notification.message}
                      </p>

                      {notification.dueDate && (
                        <div className='text-xs text-muted-foreground'>
                          {isRtl ? 'تاريخ الاستحقاق: ' : 'Due: '}

                          {isRtl
                            ? toArabic(notification.dueDate, 1)
                            : notification.dueDate}
                        </div>
                      )}

                      <div className='flex flex-wrap gap-2 pt-2'>
                        {canOpenIqamaCase && (
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            className='h-7 px-2 text-xs'
                            disabled={markRead.isPending}
                            onClick={() => openIqamaRenewalCase(item)}
                          >
                            <ClipboardCheck
                              className={
                                isRtl ? 'ml-1 h-3 w-3' : 'mr-1 h-3 w-3'
                              }
                            />

                            {isExpiryNotification
                              ? isRtl
                                ? 'بدء الإجراء'
                                : 'Start Process'
                              : isRtl
                                ? 'فتح المعاملة'
                                : 'Open Case'}
                          </Button>
                        )}

                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          className='h-7 px-2 text-xs'
                          disabled={archive.isPending}
                          onClick={() => archive.mutate(item.id)}
                        >
                          <Archive
                            className={isRtl ? 'ml-1 h-3 w-3' : 'mr-1 h-3 w-3'}
                          />

                          {isRtl ? 'إخفاء' : 'Archive'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
