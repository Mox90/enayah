// src/modules/hr/iqama-renewal/components/iqama-renewal-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { IqamaRenewalStatus } from '../types/iqama-renewal.types'
import { useTranslations } from 'next-intl'

const statusClass: Record<IqamaRenewalStatus, string> = {
  pending_upload: 'border-amber-200 bg-amber-50 text-amber-700',
  uploaded_to_mhrsd: 'border-blue-200 bg-blue-50 text-blue-700',
  under_process: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  approved_by_mhrsd: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  denied_by_mhrsd: 'border-red-200 bg-red-50 text-red-700',
  sent_to_government_relations: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  completed: 'border-slate-200 bg-slate-100 text-slate-700',
  eoc_required: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-gray-200 bg-gray-100 text-gray-700',
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
      className={cn('whitespace-nowrap', statusClass[status])}
    >
      {/* {humanize(status)} */}
      {t(status)}
    </Badge>
  )
}
