// 'use client'

// import { Button } from '@/components/ui/button'

// import { EmployeeView } from '../../types/employee-view.types'
// import { EmployeeSelectionActions } from './employee-selection-actions'
// import { EmployeeViewSwitcher } from './employee-view-switcher'
// import { useTranslations } from 'next-intl'

// interface Props {
//   view: EmployeeView
//   selectedIds: string[]
//   onViewChange: (view: EmployeeView) => void
//   onBoard?: () => void
//   onFilter?: () => void
// }

// export function EmployeeToolbar({
//   view,
//   selectedIds,
//   onViewChange,
//   onBoard,
//   onFilter,
// }: Props) {
//   const t = useTranslations('employees')
//   const ct = useTranslations('common')
//   return (
//     <div className='flex items-center justify-between'>
//       <div className='flex items-center gap-3'>
//         <Button onClick={onBoard}>{t('hireEmployee')}</Button>

//         <Button variant='outline' onClick={onFilter}>
//           {ct('filter')}
//         </Button>

//         <EmployeeSelectionActions selectedIds={selectedIds} />
//       </div>

//       <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
//     </div>
//   )
// }

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { EmployeeView } from '../../types/employee-view.types'
import { EmployeeSelectionActions } from './employee-selection-actions'
import { EmployeeViewSwitcher } from './employee-view-switcher'
import { useTranslations } from 'next-intl'
import { Filter, UserPlus } from 'lucide-react'

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
    <div
      className={cn(
        'rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur',
        'flex flex-col gap-3',
        'lg:flex-row lg:items-center lg:justify-between',
      )}
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
        <div className='grid grid-cols-2 gap-2 sm:flex sm:items-center'>
          <Button onClick={onBoard} className='h-10 rounded-xl shadow-sm'>
            <UserPlus className='mr-2 h-4 w-4' />
            <span className='truncate'>{t('hireEmployee')}</span>
          </Button>

          <Button
            variant='outline'
            onClick={onFilter}
            className='h-10 rounded-xl'
          >
            <Filter className='mr-2 h-4 w-4' />
            <span className='truncate'>{ct('filter')}</span>
          </Button>
        </div>

        <EmployeeSelectionActions selectedIds={selectedIds} />
      </div>

      <div className='flex justify-start lg:justify-end'>
        <EmployeeViewSwitcher view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
