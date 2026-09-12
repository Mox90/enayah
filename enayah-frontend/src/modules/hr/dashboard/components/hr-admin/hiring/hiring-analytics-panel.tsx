// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-panel.tsx

'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

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

import { TabsContent } from '@/components/ui/tabs'

type HiringTrendItem = {
  month: number

  physician: number
  nurse: number
  alliedHealth: number
  administrative: number
  supportService: number
}

type HiringAnalyticsData = {
  hiringTrend: HiringTrendItem[]
}

interface HiringAnalyticsPanelProps {
  year: number

  data?: HiringAnalyticsData

  isLoading: boolean
  isFetching: boolean
  isError: boolean

  onRetry: () => void | Promise<unknown>
}

const HiringAnalyticsPanel = ({
  year,

  data,

  isLoading,
  isFetching,
  isError,

  onRetry,
}: HiringAnalyticsPanelProps) => {
  const locale = useLocale()

  const t = useTranslations('hrDashboard.admin')

  // ----------------------------------
  // Hiring trend chart data
  //
  // Convert:
  //   1  -> Jan
  //   2  -> Feb
  //   ...
  //
  // according to the current locale.
  // ----------------------------------

  const hiringTrendData = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
    })

    return (
      data?.hiringTrend.map((item) => ({
        ...item,

        month: monthFormatter.format(new Date(2000, item.month - 1, 1)),
      })) ?? []
    )
  }, [data?.hiringTrend, locale])

  return (
    <TabsContent value='hiring' className='mt-0'>
      {/* ==================================
          HEADING
      ================================== */}

      <div className='mb-4'>
        <h2 className='text-xl font-semibold'>{t('hiringAnalytics.title')}</h2>

        <p className='text-sm text-muted-foreground'>
          {t('hiringAnalytics.description')}
        </p>
      </div>

      {/* ==================================
          ERROR
      ================================== */}

      {isError ? (
        <div className='flex h-[420px] items-center justify-center rounded-2xl border bg-background'>
          <div className='text-center'>
            <p className='font-medium'>
              {t('errors.activity.title', {
                year,
              })}
            </p>

            <p className='mt-1 text-sm text-muted-foreground'>
              {t('errors.activity.description')}
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
      ) : (
        /* ==================================
            CHART CONTAINER
        ================================== */

        <div className='relative h-[420px] rounded-2xl border bg-[#ffeff6] p-6 shadow-sm dark:bg-muted/30'>
          {/* ----------------------------------
              Background refetch indicator
          ---------------------------------- */}

          {isFetching && !isLoading && (
            <div className='absolute end-4 top-4 z-10 rounded-full bg-black/5 px-3 py-1 text-xs text-foreground dark:bg-white/10 dark:text-white'>
              {t('states.updating')}
            </div>
          )}

          {/* ==================================
              INITIAL LOADING
          ================================== */}

          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                {t('states.loadingActivity')}
              </p>
            </div>
          ) : (
            /* ==================================
                HIRING TREND CHART
            ================================== */

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
                {/* ==================================
                    GRADIENTS
                ================================== */}

                <defs>
                  {/* Physician */}

                  <linearGradient
                    id='physicianGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#f472b6' stopOpacity={0.45} />

                    <stop offset='95%' stopColor='#f472b6' stopOpacity={0.03} />
                  </linearGradient>

                  {/* Nurse */}

                  <linearGradient
                    id='nurseGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#22c55e' stopOpacity={0.45} />

                    <stop offset='95%' stopColor='#22c55e' stopOpacity={0.03} />
                  </linearGradient>

                  {/* Allied Health */}

                  <linearGradient
                    id='alliedHealthGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#38bdf8' stopOpacity={0.4} />

                    <stop offset='95%' stopColor='#38bdf8' stopOpacity={0.03} />
                  </linearGradient>

                  {/* Administrative */}

                  <linearGradient
                    id='administrativeGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#a78bfa' stopOpacity={0.4} />

                    <stop offset='95%' stopColor='#a78bfa' stopOpacity={0.03} />
                  </linearGradient>

                  {/* Support Service */}

                  <linearGradient
                    id='supportServiceGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.4} />

                    <stop offset='95%' stopColor='#f59e0b' stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                {/* ==================================
                    GRID
                ================================== */}

                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.08)'
                  vertical={false}
                />

                {/* ==================================
                    X AXIS
                ================================== */}

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

                {/* ==================================
                    Y AXIS
                ================================== */}

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

                {/* ==================================
                    TOOLTIP
                ================================== */}

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

                {/* ==================================
                    LEGEND
                ================================== */}

                <Legend
                  wrapperStyle={{
                    color: '#d1d5db',

                    paddingTop: 12,
                  }}
                />

                {/* ==================================
                    PHYSICIAN
                ================================== */}

                <Area
                  type='monotone'
                  dataKey='physician'
                  name={t('hiringAnalytics.categories.physicians')}
                  stroke='#f472b6'
                  strokeWidth={2.5}
                  fill='url(#physicianGradient)'
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                  animationDuration={900}
                />

                {/* ==================================
                    NURSE
                ================================== */}

                <Area
                  type='monotone'
                  dataKey='nurse'
                  name={t('hiringAnalytics.categories.nurses')}
                  stroke='#22c55e'
                  strokeWidth={2.5}
                  fill='url(#nurseGradient)'
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                  animationDuration={900}
                />

                {/* ==================================
                    ALLIED HEALTH
                ================================== */}

                <Area
                  type='monotone'
                  dataKey='alliedHealth'
                  name={t('hiringAnalytics.categories.alliedHealth')}
                  stroke='#38bdf8'
                  strokeWidth={2.5}
                  fill='url(#alliedHealthGradient)'
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                  animationDuration={900}
                />

                {/* ==================================
                    ADMINISTRATIVE
                ================================== */}

                <Area
                  type='monotone'
                  dataKey='administrative'
                  name={t('hiringAnalytics.categories.administrative')}
                  stroke='#a78bfa'
                  strokeWidth={2.5}
                  fill='url(#administrativeGradient)'
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                  animationDuration={900}
                />

                {/* ==================================
                    SUPPORT SERVICE
                ================================== */}

                <Area
                  type='monotone'
                  dataKey='supportService'
                  name={t('hiringAnalytics.categories.supportService')}
                  stroke='#f59e0b'
                  strokeWidth={2.5}
                  fill='url(#supportServiceGradient)'
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </TabsContent>
  )
}

export default HiringAnalyticsPanel
