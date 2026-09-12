// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-panel.tsx

'use client'

import { useTranslations } from 'next-intl'

const numberFormatter = new Intl.NumberFormat('en-US')

interface MonthlyTurnoverTooltipData {
  groupKey: string

  groupLabel: string
  workforceLabel: string

  establishedPositions: number
  occupiedPositions: number
  vacantPositions: number

  vacancyRate: number

  departments: string[]
}

interface MonthlyTurnoverTooltipPayload {
  payload?: MonthlyTurnoverTooltipData
}

interface MonthlyTurnoverTooltipProps {
  active?: boolean

  payload?: readonly MonthlyTurnoverTooltipPayload[]
}

const MonthlyTurnoverTooltip = ({
  active,
  payload,
}: MonthlyTurnoverTooltipProps) => {
  const t = useTranslations('hrDashboard.admin')

  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0]?.payload

  if (!data) {
    return null
  }

  /*
   * Administration and Support Service
   * are hospital-wide workforce
   * aggregates.
   *
   * Their individual contributing
   * departments do not need to be shown.
   */
  const showDepartments =
    data.groupKey !== 'administration' &&
    data.groupKey !== 'supportService' &&
    data.departments?.length > 0

  return (
    <div className='w-[620px] max-w-[min(620px,calc(100vw-32px))] rounded-2xl border border-white/10 bg-[#111827] p-5 text-white shadow-2xl'>
      {/* ==================================
          HEADER
      ================================== */}

      <div>
        <p className='text-lg font-semibold'>{data.groupLabel}</p>

        <p className='mt-1 text-sm text-gray-300'>{data.workforceLabel}</p>
      </div>

      {/* ==================================
          POSITION SUMMARY
      ================================== */}

      <div className='mt-5 grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-sm'>
        <span className='text-gray-400'>
          {t('staffTurnover.monthly.metrics.established')}
        </span>

        <span className='font-medium tabular-nums'>
          {numberFormatter.format(data.establishedPositions)}
        </span>

        <span className='text-gray-400'>
          {t('staffTurnover.monthly.metrics.occupied')}
        </span>

        <span className='font-medium tabular-nums'>
          {numberFormatter.format(data.occupiedPositions)}
        </span>

        <span className='text-gray-400'>
          {t('staffTurnover.monthly.metrics.vacant')}
        </span>

        <span className='font-medium tabular-nums'>
          {numberFormatter.format(data.vacantPositions)}
        </span>

        <span className='text-gray-400'>
          {t('staffTurnover.monthly.metrics.vacancyRate')}
        </span>

        <span className='font-medium tabular-nums'>
          {Number(data.vacancyRate).toFixed(1)}%
        </span>
      </div>

      {/* ==================================
          CONTRIBUTING DEPARTMENTS
      ================================== */}

      {showDepartments && (
        <div className='mt-5 border-t border-white/10 pt-4'>
          <div className='mb-3 flex items-center justify-between gap-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
              {t('staffTurnover.monthly.departments')}
            </p>

            <span className='text-xs text-gray-500'>
              {data.departments.length}
            </span>
          </div>

          {/*
           * Display every contributing
           * department.
           *
           * One column for short lists.
           * Two columns for larger groups.
           */}

          <div
            className={
              data.departments.length > 6
                ? 'grid grid-cols-2 gap-x-6 gap-y-2'
                : 'grid grid-cols-1 gap-y-2'
            }
          >
            {data.departments.map((department) => (
              <div
                key={department}
                className='flex min-w-0 items-start gap-2 text-sm'
              >
                <span className='mt-[8px] h-1 w-1 shrink-0 rounded-full bg-gray-400' />

                <span className='min-w-0 leading-5'>{department}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyTurnoverTooltip
