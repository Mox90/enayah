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

  onViewChange: (view: EmployeeView) => void
}

export function EmployeeToolbar({ view, selectedCount, onViewChange }: Props) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border p-4'>
      <div>
        <Button>Hire Employee</Button>
      </div>

      <div className='flex-1'>
        <EmployeeSelectionActions selectedCount={selectedCount} />
      </div>

      <div className='flex items-center gap-4'>
        <EmployeePagination hidden={view === 'tree' || view === 'hierarchy'} />

        <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
