'use client'

import { Button } from '@/components/ui/button'

import { EmployeeView } from '../../types/employee-view.types'
import { EmployeeSelectionActions } from './employee-selection-actions'
import { EmployeeViewSwitcher } from './employee-view-switcher'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('employees')
  const ct = useTranslations('common')
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <Button onClick={onBoard}>{t('hireEmployee')}</Button>

        <Button variant='outline' onClick={onFilter}>
          {ct('filter')}
        </Button>

        <EmployeeSelectionActions selectedIds={selectedIds} />
      </div>

      <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
    </div>
  )
}
