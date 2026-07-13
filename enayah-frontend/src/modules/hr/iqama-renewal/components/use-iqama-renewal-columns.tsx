import { useLocale, useTranslations } from 'next-intl'

import type { IqamaRenewalSortBy } from '../services/iqama-renewal.service'
import { getIqamaRenewalColumns } from './iqama-renewal-columns'

export function useIqamaRenewalColumns(
  sortBy: IqamaRenewalSortBy,
  sortOrder: 'asc' | 'desc',
  onOpen: (id: string) => void,
) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()

  const isArabic = locale.toLowerCase().startsWith('ar')

  return getIqamaRenewalColumns(
    sortBy,
    sortOrder,
    {
      employeeNumber: t('employeeNumber'),
      employeeName: t('employeeName'),
      iqamaNumber: t('iqamaNumber'),
      expiryDate: t('expiryDate'),
      currentStage: t('currentStage'),
      assignedTo: t('assignedTo'),
      uploadDate: t('mhrsdUploadDate'),
      decision: t('mhrsdDecision'),
      governmentRelationsDueDate: t('governmentRelationsDueDate'),
      daysRemaining: t('daysRemaining'),
      actions: t('actions'),
      open: t('open'),
      approved: t('approved'),
      denied: t('denied'),
      pending: t('pending'),
      overdue: t('overdue'),
      days: t('days'),
    },
    onOpen,
    isArabic,
  )
}
