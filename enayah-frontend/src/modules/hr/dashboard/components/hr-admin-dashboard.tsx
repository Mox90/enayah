// enayah-frontend/src/modules/hr/dashboard/components/hr-admin-dashboard.tsx

'use client'

import { useMemo, useState } from 'react'
import { useLocale } from 'next-intl'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  useHrAdminDashboardActivity,
  useHrAdminDashboardSummary,
} from '../hooks/use-hr-admin-dashboard'

import StatsCard from '../widgets/stats-card'

const numberFormatter = new Intl.NumberFormat('en-US')

const HRAdminDashboard = () => {
  const locale = useLocale()

  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(currentYear)

  // ----------------------------------
  // Current-state dashboard summary
  //
  // This does NOT depend on the
  // selected historical year.
  // ----------------------------------

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useHrAdminDashboardSummary()

  // ----------------------------------
  // Year-specific activity
  //
  // Only this query changes when the
  // user selects another year.
  // ----------------------------------

  const {
    data: activityData,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useHrAdminDashboardActivity(year)

  // ----------------------------------
  // Hiring trend chart data
  // ----------------------------------

  const hiringTrendData = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
    })

    return (
      activityData?.hiringTrend.map((item) => ({
        ...item,

        month: monthFormatter.format(new Date(2000, item.month - 1, 1)),
      })) ?? []
    )
  }, [activityData?.hiringTrend, locale])

  // ----------------------------------
  // Number formatter
  // ----------------------------------

  const formatValue = (value: number | undefined, loading = false) => {
    if (loading) {
      return '—'
    }

    return numberFormatter.format(value ?? 0)
  }

  // ----------------------------------
  // Summary-level error
  //
  // If the core summary cannot load,
  // the dashboard itself is unavailable.
  // ----------------------------------

  if (isSummaryError) {
    return (
      <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-6'>
        <h2 className='font-semibold text-destructive'>
          Unable to load the HR dashboard
        </h2>

        <p className='mt-1 text-sm text-muted-foreground'>
          Dashboard information could not be retrieved from the server.
        </p>

        <button
          type='button'
          className='mt-4 text-sm font-medium underline'
          onClick={() => refetchSummary()}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* ----------------------------------
          Header
      ---------------------------------- */}

      <div>
        <h1 className='text-3xl font-bold'>HR Administration Dashboard</h1>

        <p className='text-muted-foreground'>
          Human resources operations overview.
        </p>
      </div>

      {/* ----------------------------------
          KPI cards
      ---------------------------------- */}

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard
          title='Workforce Overview'
          items={[
            {
              label: 'Employees',
              value: formatValue(
                summaryData?.summary.employees,
                isSummaryLoading,
              ),
            },
            {
              label: 'Active',
              value: formatValue(
                summaryData?.summary.activeEmployees,
                isSummaryLoading,
              ),
            },
          ]}
        />

        <StatsCard
          title='Manpower Planning'
          items={[
            {
              label: 'PCN',
              value: formatValue(
                summaryData?.summary.positionItems,
                isSummaryLoading,
              ),
            },
            {
              label: 'Vacant',
              value: formatValue(
                summaryData?.summary.vacantPositionItems,
                isSummaryLoading,
              ),
            },
          ]}
        />

        <StatsCard
          title='Compliance Alerts'
          items={[
            {
              label: 'Licenses',
              value: formatValue(
                summaryData?.summary.expiringLicenses,
                isSummaryLoading,
              ),
            },
            {
              label: 'Contracts',
              value: formatValue(
                summaryData?.summary.expiringContracts,
                isSummaryLoading,
              ),
            },
          ]}
        />

        <StatsCard
          title={`Movement Activity · ${year}`}
          items={[
            {
              label: 'Transfer',
              value: formatValue(activityData?.transfers, isActivityLoading),
            },
            {
              label: 'Promotion',
              value: formatValue(activityData?.promotions, isActivityLoading),
            },
          ]}
        />
      </div>

      {/* ----------------------------------
          Hiring analytics
      ---------------------------------- */}

      <div className='rounded-2xl border bg-background p-6 shadow-sm'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Hiring Analytics</h2>

            <p className='text-sm text-muted-foreground'>
              Monthly hiring trend by workforce category.
            </p>
          </div>

          {/* ----------------------------------
              Year selector

              Years come from the summary query.

              Selecting another year only
              refetches activity data.
          ---------------------------------- */}

          <Select
            value={String(year)}
            disabled={isSummaryLoading || !summaryData?.availableYears.length}
            onValueChange={(value) => {
              setYear(Number(value))
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select year' />
            </SelectTrigger>

            <SelectContent>
              {(summaryData?.availableYears ?? []).map((availableYear) => (
                <SelectItem key={availableYear} value={String(availableYear)}>
                  {availableYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ----------------------------------
            Activity-level error

            Do not hide the rest of the
            dashboard if only historical
            activity fails.
        ---------------------------------- */}

        {isActivityError ? (
          <div className='flex h-[420px] items-center justify-center rounded-2xl border bg-background'>
            <div className='text-center'>
              <p className='font-medium'>Unable to load activity for {year}</p>

              <p className='mt-1 text-sm text-muted-foreground'>
                Hiring and movement activity could not be retrieved.
              </p>

              <button
                type='button'
                className='mt-3 text-sm font-medium underline'
                onClick={() => refetchActivity()}
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className='relative h-[420px] rounded-2xl border bg-[#111827] p-6 shadow-sm'>
            {/* ----------------------------------
                Background refetch indicator
            ---------------------------------- */}

            {isActivityFetching && !isActivityLoading && (
              <div className='absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white'>
                Updating...
              </div>
            )}

            {/* ----------------------------------
                Initial activity loading state
            ---------------------------------- */}

            {isActivityLoading ? (
              <div className='flex h-full items-center justify-center'>
                <p className='text-sm text-gray-400'>Loading activity...</p>
              </div>
            ) : (
              <ResponsiveContainer
                width='100%'
                height='100%'
                minWidth={0}
                initialDimension={{
                  width: 800,
                  height: 372,
                }}
              >
                <AreaChart data={hiringTrendData}>
                  <defs>
                    <linearGradient
                      id='physicianGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='#f472b6'
                        stopOpacity={0.45}
                      />

                      <stop
                        offset='95%'
                        stopColor='#f472b6'
                        stopOpacity={0.03}
                      />
                    </linearGradient>

                    <linearGradient
                      id='nurseGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='#22c55e'
                        stopOpacity={0.45}
                      />

                      <stop
                        offset='95%'
                        stopColor='#22c55e'
                        stopOpacity={0.03}
                      />
                    </linearGradient>

                    <linearGradient
                      id='alliedHealthGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#38bdf8' stopOpacity={0.4} />

                      <stop
                        offset='95%'
                        stopColor='#38bdf8'
                        stopOpacity={0.03}
                      />
                    </linearGradient>

                    <linearGradient
                      id='administrativeGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#a78bfa' stopOpacity={0.4} />

                      <stop
                        offset='95%'
                        stopColor='#a78bfa'
                        stopOpacity={0.03}
                      />
                    </linearGradient>

                    <linearGradient
                      id='supportServiceGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.4} />

                      <stop
                        offset='95%'
                        stopColor='#f59e0b'
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='rgba(255,255,255,0.08)'
                    vertical={false}
                  />

                  <XAxis
                    dataKey='month'
                    interval={0}
                    minTickGap={0}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    height={30}
                    padding={{
                      left: 4,
                      right: 4,
                    }}
                    tick={{
                      fill: '#9ca3af',
                      fontSize: 'clamp(10px, 2vw, 13px)',
                    }}
                  />

                  <YAxis
                    width={20}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: '#9ca3af',
                      fontSize: 13,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: '#f472b6',
                      strokeWidth: 1,
                      strokeDasharray: '4 4',
                    }}
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '14px',
                      color: '#fff',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                    }}
                    labelStyle={{
                      color: '#fff',
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      color: '#d1d5db',
                      paddingTop: 12,
                    }}
                  />

                  <Area
                    type='monotone'
                    dataKey='physician'
                    name='Physicians'
                    stroke='#f472b6'
                    strokeWidth={2.5}
                    fill='url(#physicianGradient)'
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={900}
                  />

                  <Area
                    type='monotone'
                    dataKey='nurse'
                    name='Nurses'
                    stroke='#22c55e'
                    strokeWidth={2.5}
                    fill='url(#nurseGradient)'
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={900}
                  />

                  <Area
                    type='monotone'
                    dataKey='alliedHealth'
                    name='Allied Health'
                    stroke='#38bdf8'
                    strokeWidth={2.5}
                    fill='url(#alliedHealthGradient)'
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={900}
                  />

                  <Area
                    type='monotone'
                    dataKey='administrative'
                    name='Administrative'
                    stroke='#a78bfa'
                    strokeWidth={2.5}
                    fill='url(#administrativeGradient)'
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={900}
                  />

                  <Area
                    type='monotone'
                    dataKey='supportService'
                    name='Support Service'
                    stroke='#f59e0b'
                    strokeWidth={2.5}
                    fill='url(#supportServiceGradient)'
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HRAdminDashboard
