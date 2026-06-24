// components/common/license-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const statusClass: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  revoked: 'bg-red-100 text-red-700 border-red-200',
  expired: 'bg-orange-100 text-orange-700 border-orange-200',
  suspended: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const statusLabel: Record<string, string> = {
  active: 'Active',
  revoked: 'Revoked',
  expired: 'Expired',
  suspended: 'Suspended',
}

interface Props {
  status: 'active' | 'revoked' | 'expired' | 'suspended' | string
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  const ct = useTranslations('common')
  return (
    <Badge
      variant='outline'
      className={cn(
        statusClass[status] ?? 'bg-gray-100 text-gray-700 border-gray-200',
        className,
      )}
    >
      {ct.has(status) ? ct(status) : status}
    </Badge>
  )
}
