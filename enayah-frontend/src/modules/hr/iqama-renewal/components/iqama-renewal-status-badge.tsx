// src/modules/hr/iqama-renewal/components/iqama-renewal-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { IqamaRenewalStatus } from '../types/iqama-renewal.types'
import { useTranslations } from 'next-intl'

// const statusClass: Record<IqamaRenewalStatus, string> = {
//   pending_upload: 'border-amber-200 bg-amber-50 text-amber-700',
//   uploaded_to_mhrsd: 'border-blue-200 bg-blue-50 text-blue-700',
//   under_process: 'border-indigo-200 bg-indigo-50 text-indigo-700',
//   approved_by_mhrsd: 'border-emerald-200 bg-emerald-50 text-emerald-700',
//   denied_by_mhrsd: 'border-red-200 bg-red-50 text-red-700',
//   sent_to_government_relations: 'border-cyan-200 bg-cyan-50 text-cyan-700',
//   completed: 'border-slate-200 bg-slate-100 text-slate-700',
//   eoc_required: 'border-rose-200 bg-rose-50 text-rose-700',
//   cancelled: 'border-gray-200 bg-gray-100 text-gray-700',
// }
const statusClass: Record<IqamaRenewalStatus, string> = {
  pending_upload:
    'border-amber-200 bg-amber-50 text-amber-700 ring-amber-600/10 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',

  uploaded_to_mhrsd:
    'border-blue-200 bg-blue-50 text-blue-700 ring-blue-600/10 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',

  under_process:
    'border-indigo-200 bg-indigo-50 text-indigo-700 ring-indigo-600/10 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',

  approved_by_mhrsd:
    'border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',

  denied_by_mhrsd:
    'border-red-200 bg-red-50 text-red-700 ring-red-600/10 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300',

  sent_to_government_relations:
    'border-cyan-200 bg-cyan-50 text-cyan-700 ring-cyan-600/10 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300',

  completed:
    'border-green-300 bg-green-100 text-green-800 ring-green-600/15 dark:border-green-700 dark:bg-green-950/60 dark:text-green-300',

  eoc_required:
    'border-rose-200 bg-rose-50 text-rose-700 ring-rose-600/10 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',

  cancelled:
    'border-slate-300 bg-slate-100 text-slate-600 ring-slate-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
}

function humanize(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function IqamaRenewalStatusBadge({
  status,
}: {
  status: IqamaRenewalStatus
}) {
  const t = useTranslations('iqamaRenewal')
  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold',
        'whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        'ring-1 ring-inset',
        statusClass[status],
      )}
    >
      {/* {humanize(status)} */}
      {t(status)}
    </Badge>
  )
}
