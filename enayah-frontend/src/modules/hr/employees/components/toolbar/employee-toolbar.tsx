'use client'

import { Button } from '@/components/ui/button'

import { EmployeeView } from '../../types/employee-view.types'
import { EmployeeSelectionActions } from './employee-selection-actions'
import { EmployeeViewSwitcher } from './employee-view-switcher'

interface Props {
  view: EmployeeView
  selectedIds: string[]
  onViewChange: (view: EmployeeView) => void
  onBoard?: () => void
  onFilter?: () => void
}

export function EmployeeToolbar({
  view,
  selectedIds,
  onViewChange,
  onBoard,
  onFilter,
}: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <Button onClick={onBoard}>Hire Employee</Button>

        <Button variant='outline' onClick={onFilter}>
          Filter
        </Button>

        <EmployeeSelectionActions selectedIds={selectedIds} />
      </div>

      <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
    </div>
  )
}
