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

import StatsCard from '../widgets/stats-card'
import { useHrAdminDashboard } from '../hooks/use-hr-admin-dashboard'

const numberFormatter = new Intl.NumberFormat('en-US')

const HRAdminDashboard = () => {
  const locale = useLocale()
  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(currentYear)

  const { data, isLoading, isFetching, isError, refetch } =
    useHrAdminDashboard(year)

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

  const formatValue = (value?: number) => {
    if (isLoading) {
      return '—'
    }

    return numberFormatter.format(value ?? 0)
  }

  if (isError) {
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
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>HR Administration Dashboard</h1>

        <p className='text-muted-foreground'>
          Human resources operations overview.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <StatsCard
          title='Workforce Overview'
          items={[
            {
              label: 'Employees',
              value: formatValue(data?.summary.employees),
            },
            {
              label: 'Active',
              value: formatValue(data?.summary.activeEmployees),
            },
          ]}
        />

        <StatsCard
          title='Manpower Planning'
          items={[
            {
              label: 'PCN',
              value: formatValue(data?.summary.positionItems),
            },
            {
              label: 'Vacant',
              value: formatValue(data?.summary.vacantPositionItems),
            },
          ]}
        />

        <StatsCard
          title='Compliance Alerts'
          items={[
            {
              label: 'Licenses',
              value: formatValue(data?.summary.expiringLicenses),
            },
            {
              label: 'Contracts',
              value: formatValue(data?.summary.expiringContracts),
            },
          ]}
        />

        <StatsCard
          title='Movement Activity'
          items={[
            {
              label: 'Transfer',
              value: formatValue(data?.summary.transfers),
            },
            {
              label: 'Promotion',
              value: formatValue(data?.summary.promotions),
            },
          ]}
        />
      </div>

      <div className='rounded-2xl border bg-background p-6 shadow-sm'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Hiring Analytics</h2>

            <p className='text-sm text-muted-foreground'>
              Monthly hiring trend by workforce category.
            </p>
          </div>

          <Select
            value={String(year)}
            disabled={isLoading || !data?.availableYears.length}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select year' />
            </SelectTrigger>

            <SelectContent>
              {(data?.availableYears ?? []).map((availableYear) => (
                <SelectItem key={availableYear} value={String(availableYear)}>
                  {availableYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='relative h-[420px] rounded-2xl border bg-[#111827] p-6 shadow-sm'>
          {isFetching && !isLoading && (
            <div className='absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white'>
              Updating...
            </div>
          )}

          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={hiringTrendData}>
              <defs>
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

                <linearGradient id='nurseGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#22c55e' stopOpacity={0.45} />

                  <stop offset='95%' stopColor='#22c55e' stopOpacity={0.03} />
                </linearGradient>

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
        </div>
      </div>
    </div>
  )
}

export default HRAdminDashboard
