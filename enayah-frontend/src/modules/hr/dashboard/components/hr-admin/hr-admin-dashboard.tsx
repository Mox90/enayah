// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/hr-admin-dashboard.tsx

'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Tabs } from '@/components/ui/tabs'

import {
  useHrAdminDashboardActivity,
  useHrAdminDashboardSummary,
  useHrAdminMonthlyTurnover,
} from '../../hooks/use-hr-admin-dashboard'

import HrAdminKpiCards from './hr-admin-kpi-cards'

import HrAdminReportToolbar, {
  type DashboardReport,
  type TurnoverPeriod,
} from './hr-admin-report-toolbar'

import HiringAnalyticsPanel from './hiring/hiring-analytics-panel'

import TurnoverReport from './turnover/turnover-report'

const HRAdminDashboard = () => {
  const t = useTranslations('hrDashboard.admin')

  // ----------------------------------
  // Current date defaults
  // ----------------------------------

  const now = new Date()

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1

  // ==================================
  // DASHBOARD REPORT STATE
  // ==================================

  const [activeReport, setActiveReport] = useState<DashboardReport>('hiring')

  const [turnoverPeriod, setTurnoverPeriod] =
    useState<TurnoverPeriod>('monthly')

  /*
   * Hiring/activity and turnover use separate
   * year state because their available year
   * ranges come from different business data:
   *
   * Hiring:
   *   employments.hireDate
   *
   * Turnover:
   *   position_items.establishedDate
   */
  const [activityYear, setActivityYear] = useState(currentYear)

  const [turnoverYear, setTurnoverYear] = useState(currentYear)

  const [turnoverMonth, setTurnoverMonth] = useState(currentMonth)

  const [turnoverQuarter, setTurnoverQuarter] = useState(currentQuarter)

  // ==================================
  // CURRENT DASHBOARD SUMMARY
  //
  // This is current-state data and does
  // not depend on the historical year.
  // ==================================

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useHrAdminDashboardSummary()

  // ==================================
  // YEAR-SPECIFIC HR ACTIVITY
  //
  // Used by:
  // - Movement KPI
  // - Hiring Analytics
  //
  // This uses activityYear, not the
  // turnover reporting year.
  // ==================================

  const {
    data: activityData,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useHrAdminDashboardActivity(activityYear)

  // ==================================
  // MONTHLY STAFF TURNOVER
  //
  // Turnover uses its own historical
  // PCN reporting year.
  // ==================================

  const {
    data: turnoverData,
    isLoading: isTurnoverLoading,
    isFetching: isTurnoverFetching,
    isError: isTurnoverError,
    refetch: refetchTurnover,
  } = useHrAdminMonthlyTurnover(turnoverYear, turnoverMonth)

  // ==================================
  // SUMMARY ERROR
  //
  // If the core dashboard summary
  // cannot load, stop rendering the
  // dashboard.
  // ==================================

  if (isSummaryError) {
    return (
      <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-6'>
        <h2 className='font-semibold text-destructive'>
          {t('errors.summary.title')}
        </h2>

        <p className='mt-1 text-sm text-muted-foreground'>
          {t('errors.summary.description')}
        </p>

        <button
          type='button'
          className='mt-4 text-sm font-medium underline'
          onClick={() => {
            void refetchSummary()
          }}
        >
          {t('actions.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* ==================================
          HEADER
      ================================== */}

      <div>
        <h1 className='text-3xl font-bold'>{t('title')}</h1>

        <p className='text-muted-foreground'>{t('description')}</p>
      </div>

      {/* ==================================
          KPI CARDS

          Movement Activity follows the
          Hiring / activity reporting year.
      ================================== */}

      <HrAdminKpiCards
        year={activityYear}
        summary={summaryData?.summary}
        activity={activityData}
        isSummaryLoading={isSummaryLoading}
        isActivityLoading={isActivityLoading}
        isActivityError={isActivityError}
      />

      {/* ==================================
          ANALYTICS REPORTS
      ================================== */}

      <div className='rounded-2xl border bg-background p-6 shadow-sm'>
        <Tabs
          value={activeReport}
          onValueChange={(value) => {
            setActiveReport(value as DashboardReport)
          }}
          className='w-full'
        >
          {/* ==================================
              REPORT TOOLBAR

              Hiring:
                activityYear

              Turnover:
                turnoverYear
          ================================== */}

          <HrAdminReportToolbar
            activeReport={activeReport}
            turnoverPeriod={turnoverPeriod}
            onTurnoverPeriodChange={setTurnoverPeriod}
            year={activeReport === 'turnover' ? turnoverYear : activityYear}
            onYearChange={
              activeReport === 'turnover' ? setTurnoverYear : setActivityYear
            }
            month={turnoverMonth}
            onMonthChange={setTurnoverMonth}
            quarter={turnoverQuarter}
            onQuarterChange={setTurnoverQuarter}
            availableYears={summaryData?.availableYears ?? []}
            availableTurnoverYears={summaryData?.availableTurnoverYears ?? []}
            isSummaryLoading={isSummaryLoading}
          />

          {/* ==================================
              HIRING ANALYTICS
          ================================== */}

          <HiringAnalyticsPanel
            year={activityYear}
            data={activityData}
            isLoading={isActivityLoading}
            isFetching={isActivityFetching}
            isError={isActivityError}
            onRetry={refetchActivity}
          />

          {/* ==================================
              STAFF TURNOVER
          ================================== */}

          <TurnoverReport
            period={turnoverPeriod}
            year={turnoverYear}
            month={turnoverMonth}
            quarter={turnoverQuarter}
            data={turnoverData}
            isLoading={isTurnoverLoading}
            isFetching={isTurnoverFetching}
            isError={isTurnoverError}
            onRetry={refetchTurnover}
          />
        </Tabs>
      </div>
    </div>
  )
}

export default HRAdminDashboard
