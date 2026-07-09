// src/modules/notifications/components/notification-bell.tsx

'use client'

import { Bell, Check, Archive } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  useArchiveNotification,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/use-notifications'
import { toArabic, toArabicDigits } from '@/utils/utilities'

const severityClass: Record<string, string> = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
}

export function NotificationBell() {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const { data = [], isLoading, isError } = useNotifications()
  const markRead = useMarkNotificationRead()
  const archive = useArchiveNotification()

  const unreadCount = data.filter((item) => !item.isRead).length

  return (
    <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Notifications'
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

          {!isLoading && data.length === 0 && (
            <div className='px-4 py-6 text-sm text-muted-foreground'>
              {isRtl ? 'لا توجد إشعارات.' : 'No notifications.'}
            </div>
          )}

          {!isLoading &&
            data.map((item) => (
              <div
                key={item.id}
                className={`border-b px-4 py-3 ${
                  item.isRead ? 'bg-background' : 'bg-muted/40'
                }`}
              >
                <div className='flex gap-3'>
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      severityClass[item.notification.severity] ??
                      'bg-slate-400'
                    }`}
                  />

                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='text-sm font-semibold leading-snug'>
                      {item.notification.title}
                    </div>

                    <p className='line-clamp-2 text-xs text-muted-foreground'>
                      {item.notification.message}
                    </p>

                    {item.notification.dueDate && (
                      <div className='text-xs text-muted-foreground'>
                        {isRtl ? 'تاريخ الاستحقاق: ' : 'Due: '}
                        {isRtl
                          ? toArabic(item.notification.dueDate, 1)
                          : item.notification.dueDate}
                      </div>
                    )}

                    <div className='flex gap-2 pt-2'>
                      {!item.isRead && (
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          className='h-7 px-2 text-xs'
                          //onClick={() => markRead.mutate(item.id)}
                          disabled={markRead.isPending}
                          onClick={() => markRead.mutate(item.id)}
                        >
                          <Check className='mr-1 h-3 w-3' />
                          {isRtl ? 'مقروء' : 'Read'}
                        </Button>
                      )}

                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        className='h-7 px-2 text-xs'
                        //onClick={() => archive.mutate(item.id)}
                        disabled={archive.isPending}
                        onClick={() => archive.mutate(item.id)}
                      >
                        <Archive className='mr-1 h-3 w-3' />
                        {isRtl ? 'إخفاء' : 'Archive'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
