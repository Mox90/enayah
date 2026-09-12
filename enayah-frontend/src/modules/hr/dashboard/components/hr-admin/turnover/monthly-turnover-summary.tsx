// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-summary.tsx

'use client'

import { useTranslations } from 'next-intl'

import type { MonthlyTurnoverSummary as MonthlyTurnoverSummaryType } from '../../../types/hr-dashboard.types'

interface MonthlyTurnoverSummaryProps {
  summary: MonthlyTurnoverSummaryType
}

const numberFormatter = new Intl.NumberFormat('en-US')

const MonthlyTurnoverSummary = ({ summary }: MonthlyTurnoverSummaryProps) => {
  const t = useTranslations('hrDashboard.admin')

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {/* ==================================
          VACANCY RATE
      ================================== */}

      <div className='rounded-2xl border bg-card p-5 shadow-sm'>
        <p className='text-sm font-medium text-muted-foreground'>
          {t('staffTurnover.monthly.metrics.vacancyRate')}
        </p>

        <div className='mt-2 flex items-end gap-1'>
          <span className='text-3xl font-bold tracking-tight'>
            {summary.vacancyRate.toFixed(1)}
          </span>

          <span className='pb-1 text-sm font-medium text-muted-foreground'>
            %
          </span>
        </div>
      </div>

      {/* ==================================
          ESTABLISHED
      ================================== */}

      <div className='rounded-2xl border bg-card p-5 shadow-sm'>
        <p className='text-sm font-medium text-muted-foreground'>
          {t('staffTurnover.monthly.metrics.established')}
        </p>

        <p className='mt-2 text-3xl font-bold tracking-tight'>
          {numberFormatter.format(summary.establishedPositions)}
        </p>
      </div>

      {/* ==================================
          OCCUPIED
      ================================== */}

      <div className='rounded-2xl border bg-card p-5 shadow-sm'>
        <p className='text-sm font-medium text-muted-foreground'>
          {t('staffTurnover.monthly.metrics.occupied')}
        </p>

        <p className='mt-2 text-3xl font-bold tracking-tight'>
          {numberFormatter.format(summary.occupiedPositions)}
        </p>
      </div>

      {/* ==================================
          VACANT
      ================================== */}

      <div className='rounded-2xl border bg-card p-5 shadow-sm'>
        <p className='text-sm font-medium text-muted-foreground'>
          {t('staffTurnover.monthly.metrics.vacant')}
        </p>

        <p className='mt-2 text-3xl font-bold tracking-tight'>
          {numberFormatter.format(summary.vacantPositions)}
        </p>
      </div>
    </div>
  )
}

export default MonthlyTurnoverSummary
