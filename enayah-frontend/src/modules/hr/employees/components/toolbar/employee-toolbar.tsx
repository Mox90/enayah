// enayah-frontend/src/modules/hr/employees/components/toolbar/employee-toolbar.tsx

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { EmployeeView } from '../../types/employee-view.types'
import { EmployeeSelectionActions } from './employee-selection-actions'
import { EmployeeViewSwitcher } from './employee-view-switcher'
import { useTranslations } from 'next-intl'
import { Filter, UserPlus } from 'lucide-react'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'

interface Props {
  view: EmployeeView
  selectedIds: string[]
  selectedEmployees: EmployeeDirectoryRow[]
  onViewChange: (view: EmployeeView) => void
  onBoard?: () => void
  onFilter?: () => void
}

export function EmployeeToolbar({
  view,
  selectedIds,
  selectedEmployees,
  onViewChange,
  onBoard,
  onFilter,
}: Props) {
  const t = useTranslations('employees')
  const ct = useTranslations('common')

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur',
        'flex flex-col gap-3',
        'lg:flex-row lg:items-center lg:justify-between',
      )}
    >
      {/* Primary actions */}
      <div className='flex min-w-0 items-center gap-2 overflow-x-auto'>
        {/* Hire employee */}

        <Button
          onClick={onBoard}
          aria-label={t('hireEmployee')}
          className={cn(
            'size-10 shrink-0 rounded-xl p-0 shadow-sm',
            'sm:h-10 sm:w-auto sm:px-4',
            'hover:text-emerald-700',
          )}
        >
          <UserPlus className='size-4 shrink-0' />

          <span className='hidden sm:ms-2 sm:inline'>{t('hireEmployee')}</span>
        </Button>

        {/* Filter */}

        <Button
          variant='outline'
          onClick={onFilter}
          aria-label={ct('filter')}
          className={cn(
            'size-10 shrink-0 rounded-xl p-0',
            'sm:h-10 sm:w-auto sm:px-4',
            'hover:text-green-400',
          )}
        >
          <Filter className='size-4 shrink-0' />

          <span className='hidden sm:ms-2 sm:inline'>{ct('filter')}</span>
        </Button>

        {/* Selection actions */}

        {/* <EmployeeSelectionActions selectedIds={selectedIds} /> */}
        <EmployeeSelectionActions
          selectedIds={selectedIds}
          selectedEmployees={selectedEmployees}
        />
      </div>

      {/* View switcher */}

      <div className='flex justify-start lg:justify-end'>
        <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
