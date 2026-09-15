// enayah-frontend/src/modules/hr/iqama-renewal/components/iqama-renewal-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import type { IqamaRenewalStatus } from '../types/iqama-renewal.types'

import { IQAMA_RENEWAL_STATUS_CLASSES } from '../config/iqama-renewal-styles'

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
        IQAMA_RENEWAL_STATUS_CLASSES[status],
      )}
    >
      {t(status)}
    </Badge>
  )
}
