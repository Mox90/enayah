'use client'

//import { EmployeeView } from '../../types/employee-view.types'

import { Button } from '@/components/ui/button'

import { EmployeeViewSwitcher } from './employee-view-switcher'
import { EmployeeSelectionActions } from './employee-selection-actions'
import { EmployeePagination } from './employee-pagination'
import { EmployeeView } from '../../types/employee-view.types'

interface Props {
  view: EmployeeView
  selectedCount: number
  range: {
    start: number
    end: number
  }
  total: number
  onViewChange: (view: EmployeeView) => void
  onRangeChange: (range: { start: number; end: number }) => void
}

export function EmployeeToolbar({
  view,
  selectedCount,
  range,
  total,
  onViewChange,
  onRangeChange,
}: Props) {
  return (
    <>
      {/* <div className='flex items-center justify-between gap-4 rounded-lg border p-4'> */}
      <div className='flex justify-between gap-4 p-1'>
        <div>
          <Button>Hire Employee</Button>
        </div>

        <div className='flex-1'>
          <EmployeeSelectionActions selectedCount={selectedCount} />
        </div>

        <div className='flex items-center gap-4'>
          <EmployeePagination
            hidden={view === 'tree' || view === 'hierarchy'}
            range={range}
            total={total}
            onRangeChange={onRangeChange}
          />

          <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </>
  )
}
