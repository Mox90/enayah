// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/hr-admin-report-toolbar.tsx

'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DashboardReport = 'hiring' | 'turnover'

export type TurnoverPeriod = 'monthly' | 'quarterly'

interface HrAdminReportToolbarProps {
  activeReport: DashboardReport

  turnoverPeriod: TurnoverPeriod
  onTurnoverPeriodChange: (value: TurnoverPeriod) => void

  year: number
  onYearChange: (value: number) => void

  month: number
  onMonthChange: (value: number) => void

  quarter: number
  onQuarterChange: (value: number) => void

  availableYears: number[]
  isSummaryLoading: boolean
}

const HrAdminReportToolbar = ({
  activeReport,

  turnoverPeriod,
  onTurnoverPeriodChange,

  year,
  onYearChange,

  month,
  onMonthChange,

  quarter,
  onQuarterChange,

  availableYears,
  isSummaryLoading,
}: HrAdminReportToolbarProps) => {
  const locale = useLocale()

  const t = useTranslations('hrDashboard.admin')

  // ----------------------------------
  // Localized month options
  // ----------------------------------

  const months = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    })

    return Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,

      label: monthFormatter.format(new Date(2000, index, 1)),
    }))
  }, [locale])

  return (
    <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      {/* ==================================
          MAIN REPORT SELECTOR

          This TabsList belongs to the
          parent <Tabs> in
          hr-admin-dashboard.tsx.
      ================================== */}

      <TabsList>
        <TabsTrigger value='hiring'>{t('reports.hiring')}</TabsTrigger>

        <TabsTrigger value='turnover'>{t('reports.turnover')}</TabsTrigger>
      </TabsList>

      {/* ==================================
          REPORT CONTROLS
      ================================== */}

      <div className='flex flex-wrap items-center gap-3'>
        {/* ==================================
            STAFF TURNOVER CONTROLS

            These are hidden completely when
            Hiring Analytics is selected.
        ================================== */}

        {activeReport === 'turnover' && (
          <>
            {/* ----------------------------------
                Monthly / Quarterly
            ---------------------------------- */}

            <Tabs
              value={turnoverPeriod}
              onValueChange={(value) => {
                onTurnoverPeriodChange(value as TurnoverPeriod)
              }}
            >
              <TabsList>
                <TabsTrigger value='monthly'>
                  {t('staffTurnover.period.monthly')}
                </TabsTrigger>

                <TabsTrigger value='quarterly'>
                  {t('staffTurnover.period.quarterly')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* ==================================
                MONTH SELECTOR

                Visible only for:
                Staff Turnover → Monthly
            ================================== */}

            {turnoverPeriod === 'monthly' && (
              <Select
                value={String(month)}
                onValueChange={(value) => {
                  onMonthChange(Number(value))
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue
                    placeholder={t('staffTurnover.monthly.selectMonth')}
                  />
                </SelectTrigger>

                <SelectContent>
                  {months.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* ==================================
                QUARTER SELECTOR

                Visible only for:
                Staff Turnover → Quarterly
            ================================== */}

            {turnoverPeriod === 'quarterly' && (
              <Select
                value={String(quarter)}
                onValueChange={(value) => {
                  onQuarterChange(Number(value))
                }}
              >
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {[1, 2, 3, 4].map((item) => (
                    <SelectItem key={item} value={String(item)}>
                      {t('staffTurnover.quarterly.quarter', {
                        quarter: item,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}

        {/* ==================================
            YEAR SELECTOR

            Always visible.

            Hiring:
              [Year]

            Turnover Monthly:
              Monthly | Quarterly
              [Month] [Year]

            Turnover Quarterly:
              Monthly | Quarterly
              [Quarter] [Year]
        ================================== */}

        <Select
          value={String(year)}
          disabled={isSummaryLoading || availableYears.length === 0}
          onValueChange={(value) => {
            onYearChange(Number(value))
          }}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder={t('hiringAnalytics.selectYear')} />
          </SelectTrigger>

          <SelectContent>
            {availableYears.map((availableYear) => (
              <SelectItem key={availableYear} value={String(availableYear)}>
                {availableYear}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default HrAdminReportToolbar
