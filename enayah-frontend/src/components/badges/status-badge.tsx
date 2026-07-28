// src/components/badges/status-badge.tsx

'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const statusBadgeClass: Record<string, string> = {
  // Shared / license statuses
  active:
    'border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',

  revoked:
    'border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',

  expired:
    'border-orange-200 bg-orange-50 text-orange-700 ring-orange-600/10 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',

  suspended:
    'border-yellow-300 bg-yellow-50 text-yellow-800 ring-yellow-600/10 dark:border-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',

  // Employment statuses
  terminated:
    'border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',

  resigned:
    'border-orange-200 bg-orange-50 text-orange-700 ring-orange-600/10 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',

  eoc: 'border-amber-200 bg-amber-50 text-amber-800 ring-amber-600/10 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',

  transferred:
    'border-cyan-200 bg-cyan-50 text-cyan-700 ring-cyan-600/10 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300',

  retired:
    'border-violet-200 bg-violet-50 text-violet-700 ring-violet-600/10 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300',

  on_leave:
    'border-blue-200 bg-blue-50 text-blue-700 ring-blue-600/10 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',

  deceased:
    'border-slate-300 bg-slate-100 text-slate-700 ring-slate-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
}

interface Props {
  status?: string | null
  label?: ReactNode
  className?: string
}

function formatStatus(status: string) {
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function StatusBadge({ status, label, className }: Props) {
  const ct = useTranslations('employees')

  if (!status) {
    return (
      <Badge
        variant='outline'
        className={cn(
          'justify-center whitespace-nowrap rounded-full',
          'border-slate-200 bg-slate-50 px-2.5 py-1',
          'text-xs font-medium text-slate-500',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
          className,
        )}
      >
        -
      </Badge>
    )
  }

  const displayedLabel =
    label ?? (ct.has(status) ? ct(status) : formatStatus(status))

  return (
    <Badge
      variant='outline'
      className={cn(
        'justify-center gap-1.5 whitespace-nowrap rounded-full',
        'px-2.5 py-1 text-xs font-semibold',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        'ring-1 ring-inset',
        statusBadgeClass[status] ??
          'border-slate-200 bg-slate-50 text-slate-600 ring-slate-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        className,
      )}
    >
      {displayedLabel}
    </Badge>
  )
}
