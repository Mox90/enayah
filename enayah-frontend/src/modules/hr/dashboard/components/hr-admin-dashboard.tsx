// enayah-frontend/src/modules/hr/dashboard/components/hr-admin-dashboard.tsx

'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

const hiringTrendByYear = {
  2022: [
    {
      month: 'Jan',
      physician: 2,
      nurse: 8,
      alliedHealth: 3,
      administrative: 1,
      supportService: 4,
    },
    {
      month: 'Feb',
      physician: 1,
      nurse: 5,
      alliedHealth: 2,
      administrative: 0,
      supportService: 2,
    },
    {
      month: 'Mar',
      physician: 4,
      nurse: 10,
      alliedHealth: 5,
      administrative: 0,
      supportService: 6,
    },
    {
      month: 'Apr',
      physician: 0,
      nurse: 6,
      alliedHealth: 4,
      administrative: 1,
      supportService: 3,
    },
    {
      month: 'May',
      physician: 3,
      nurse: 9,
      alliedHealth: 2,
      administrative: 4,
      supportService: 5,
    },
    {
      month: 'Jun',
      physician: 2,
      nurse: 7,
      alliedHealth: 3,
      administrative: 2,
      supportService: 4,
    },
    {
      month: 'Jul',
      physician: 1,
      nurse: 4,
      alliedHealth: 1,
      administrative: 1,
      supportService: 2,
    },
    {
      month: 'Aug',
      physician: 5,
      nurse: 11,
      alliedHealth: 6,
      administrative: 3,
      supportService: 7,
    },
    {
      month: 'Sep',
      physician: 3,
      nurse: 8,
      alliedHealth: 4,
      administrative: 2,
      supportService: 3,
    },
    {
      month: 'Oct',
      physician: 2,
      nurse: 6,
      alliedHealth: 5,
      administrative: 3,
      supportService: 5,
    },
    {
      month: 'Nov',
      physician: 1,
      nurse: 5,
      alliedHealth: 2,
      administrative: 2,
      supportService: 4,
    },
    {
      month: 'Dec',
      physician: 4,
      nurse: 9,
      alliedHealth: 3,
      administrative: 1,
      supportService: 6,
    },
  ],
  2023: [
    {
      month: 'Jan',
      physician: 3,
      nurse: 7,
      alliedHealth: 4,
      administrative: 2,
      supportService: 5,
    },
    {
      month: 'Feb',
      physician: 2,
      nurse: 6,
      alliedHealth: 3,
      administrative: 1,
      supportService: 3,
    },
    {
      month: 'Mar',
      physician: 5,
      nurse: 12,
      alliedHealth: 6,
      administrative: 4,
      supportService: 7,
    },
    {
      month: 'Apr',
      physician: 1,
      nurse: 8,
      alliedHealth: 4,
      administrative: 2,
      supportService: 4,
    },
    {
      month: 'May',
      physician: 4,
      nurse: 10,
      alliedHealth: 5,
      administrative: 3,
      supportService: 6,
    },
    {
      month: 'Jun',
      physician: 2,
      nurse: 9,
      alliedHealth: 3,
      administrative: 2,
      supportService: 5,
    },
    {
      month: 'Jul',
      physician: 2,
      nurse: 5,
      alliedHealth: 2,
      administrative: 1,
      supportService: 3,
    },
    {
      month: 'Aug',
      physician: 6,
      nurse: 13,
      alliedHealth: 7,
      administrative: 4,
      supportService: 8,
    },
    {
      month: 'Sep',
      physician: 3,
      nurse: 9,
      alliedHealth: 4,
      administrative: 3,
      supportService: 4,
    },
    {
      month: 'Oct',
      physician: 2,
      nurse: 7,
      alliedHealth: 5,
      administrative: 2,
      supportService: 5,
    },
    {
      month: 'Nov',
      physician: 2,
      nurse: 6,
      alliedHealth: 3,
      administrative: 2,
      supportService: 4,
    },
    {
      month: 'Dec',
      physician: 5,
      nurse: 10,
      alliedHealth: 4,
      administrative: 2,
      supportService: 7,
    },
  ],
}

const HRAdminDashboard = () => {
  const [year, setYear] = useState('2022')

  const hiringTrendData = useMemo(() => {
    return (
      hiringTrendByYear[Number(year) as keyof typeof hiringTrendByYear] ?? []
    )
  }, [year])

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
            { label: 'Employees', value: '1,245' },
            { label: 'Active', value: '1,210' },
          ]}
        />

        <StatsCard
          title='Manpower Planning'
          items={[
            { label: 'PCN', value: '1,500' },
            { label: 'Vacant', value: '255' },
          ]}
        />

        <StatsCard
          title='Compliance Alerts'
          items={[
            { label: 'Licenses', value: '32' },
            { label: 'Contracts', value: '12' },
          ]}
        />

        <StatsCard
          title='Movement Activity'
          items={[
            { label: 'Transfer', value: '8' },
            { label: 'Promotion', value: '4' },
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

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select year' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='2022'>2022</SelectItem>
              <SelectItem value='2023'>2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='h-[420px] rounded-2xl border bg-[#111827] p-6 shadow-sm'>
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
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 13 }}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 13 }}
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
