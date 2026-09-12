// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-panel.tsx

'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import type { MonthlyTurnoverResponse } from '../../../types/hr-dashboard.types'

import MonthlyTurnoverChart from './monthly-turnover-chart'
import MonthlyTurnoverSummary from './monthly-turnover-summary'

interface MonthlyTurnoverPanelProps {
  year: number
  month: number

  data?: MonthlyTurnoverResponse

  isLoading: boolean
  isFetching: boolean
  isError: boolean

  onRetry: () => void | Promise<unknown>
}

const MonthlyTurnoverPanel = ({
  year,
  month,

  data,

  isLoading,
  isFetching,
  isError,

  onRetry,
}: MonthlyTurnoverPanelProps) => {
  const locale = useLocale()

  const t = useTranslations('hrDashboard.admin')

  // ----------------------------------
  // Selected reporting period
  //
  // Example:
  // September 2026
  // ----------------------------------

  const periodLabel = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })

    const monthName = monthFormatter.format(new Date(2000, month - 1, 1))

    return `${monthName} ${year}`
  }, [locale, month, year])

  return (
    <div className='space-y-6'>
      {/* ==================================
          HEADING
      ================================== */}

      <div>
        <h2 className='text-xl font-semibold'>
          {t('staffTurnover.monthly.title')}
        </h2>

        <p className='text-sm text-muted-foreground'>
          {t('staffTurnover.monthly.description')}
        </p>
      </div>

      {/* ==================================
          ERROR
      ================================== */}

      {isError ? (
        <div className='flex min-h-[320px] items-center justify-center rounded-2xl border bg-background p-6'>
          <div className='text-center'>
            <p className='font-medium'>
              {t('staffTurnover.errors.monthlyTitle', {
                period: periodLabel,
              })}
            </p>

            <p className='mt-1 text-sm text-muted-foreground'>
              {t('staffTurnover.errors.monthlyDescription')}
            </p>

            <button
              type='button'
              className='mt-3 text-sm font-medium underline'
              onClick={() => {
                void onRetry()
              }}
            >
              {t('actions.tryAgain')}
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* ==================================
            INITIAL LOADING
        ================================== */

        <div className='flex min-h-[420px] items-center justify-center rounded-2xl border bg-background'>
          <p className='text-sm text-muted-foreground'>
            {t('staffTurnover.states.loading')}
          </p>
        </div>
      ) : !data || data.rows.length === 0 ? (
        /* ==================================
            EMPTY REPORT
        ================================== */

        <div className='flex min-h-[320px] items-center justify-center rounded-2xl border bg-[#ffeff6] p-6 shadow-sm dark:bg-muted/30'>
          <div className='text-center'>
            <p className='font-medium'>{t('staffTurnover.noData')}</p>

            <p className='mt-1 text-sm text-muted-foreground'>{periodLabel}</p>
          </div>
        </div>
      ) : (
        <>
          {/* ==================================
              SUMMARY
          ================================== */}

          <MonthlyTurnoverSummary summary={data.summary} />

          {/* ==================================
              CHART
          ================================== */}

          <MonthlyTurnoverChart
            rows={data.rows}
            periodLabel={periodLabel}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  )
}

export default MonthlyTurnoverPanel
