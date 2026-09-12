// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/turnover-report.tsx

'use client'

import { TabsContent } from '@/components/ui/tabs'

import type { MonthlyTurnoverResponse } from '../../../types/hr-dashboard.types'

import type { TurnoverPeriod } from '../hr-admin-report-toolbar'

import MonthlyTurnoverPanel from './monthly-turnover-panel'
import QuarterlyTurnoverPanel from './quarterly-turnover-panel'

interface TurnoverReportProps {
  period: TurnoverPeriod

  year: number
  month: number
  quarter: number

  data?: MonthlyTurnoverResponse

  isLoading: boolean
  isFetching: boolean
  isError: boolean

  onRetry: () => void | Promise<unknown>
}

const TurnoverReport = ({
  period,

  year,
  month,
  quarter,

  data,

  isLoading,
  isFetching,
  isError,

  onRetry,
}: TurnoverReportProps) => {
  return (
    <TabsContent value='turnover' className='mt-0'>
      {period === 'monthly' ? (
        <MonthlyTurnoverPanel
          year={year}
          month={month}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={onRetry}
        />
      ) : (
        <QuarterlyTurnoverPanel year={year} quarter={quarter} />
      )}
    </TabsContent>
  )
}

export default TurnoverReport
