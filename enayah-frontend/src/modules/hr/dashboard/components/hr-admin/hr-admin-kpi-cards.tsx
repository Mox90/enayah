// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/hr-admin-kpi-cards.tsx

'use client'

import { useTranslations } from 'next-intl'

import StatsCard from '../../widgets/stats-card'

interface HrAdminKpiCardsProps {
  year: number

  summary?: {
    employees: number
    activeEmployees: number
    positionItems: number
    vacantPositionItems: number
    expiringLicenses: number
    expiringContracts: number
  }

  activity?: {
    transfers: number
    promotions: number
  }

  isSummaryLoading: boolean
  isActivityLoading: boolean
}

const numberFormatter = new Intl.NumberFormat('en-US')

const HrAdminKpiCards = ({
  year,
  summary,
  activity,
  isSummaryLoading,
  isActivityLoading,
}: HrAdminKpiCardsProps) => {
  const t = useTranslations('hrDashboard.admin')

  const formatValue = (value: number | undefined, loading = false) => {
    if (loading) {
      return '—'
    }

    return numberFormatter.format(value ?? 0)
  }

  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      <StatsCard
        title={t('cards.workforce.title')}
        items={[
          {
            label: t('cards.workforce.employees'),
            value: formatValue(summary?.employees, isSummaryLoading),
          },

          {
            label: t('cards.workforce.active'),
            value: formatValue(summary?.activeEmployees, isSummaryLoading),
          },
        ]}
      />

      <StatsCard
        title={t('cards.manpower.title')}
        items={[
          {
            label: t('cards.manpower.pcn'),
            value: formatValue(summary?.positionItems, isSummaryLoading),
          },

          {
            label: t('cards.manpower.vacant'),
            value: formatValue(summary?.vacantPositionItems, isSummaryLoading),
          },
        ]}
      />

      <StatsCard
        title={t('cards.compliance.title')}
        items={[
          {
            label: t('cards.compliance.licenses'),
            value: formatValue(summary?.expiringLicenses, isSummaryLoading),
          },

          {
            label: t('cards.compliance.contracts'),
            value: formatValue(summary?.expiringContracts, isSummaryLoading),
          },
        ]}
      />

      <StatsCard
        title={t('cards.movement.title', {
          year,
        })}
        items={[
          {
            label: t('cards.movement.transfer'),
            value: formatValue(activity?.transfers, isActivityLoading),
          },

          {
            label: t('cards.movement.promotion'),
            value: formatValue(activity?.promotions, isActivityLoading),
          },
        ]}
      />
    </div>
  )
}

export default HrAdminKpiCards
