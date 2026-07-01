// 'use client'

// import { LayoutGrid } from 'lucide-react'
// import { List } from 'lucide-react'
// import { Network } from 'lucide-react'
// import { GitBranch } from 'lucide-react'

// import { Button } from '@/components/ui/button'

// import { EmployeeView } from '../../types/employee-view.types'
// import { ButtonGroup } from '@/components/ui/button-group'

// interface Props {
//   view: EmployeeView

//   onViewChange: (view: EmployeeView) => void
// }

// export function EmployeeViewSwitcher({ view, onViewChange }: Props) {
//   return (
//     <div className='flex items-center gap-1'>
//       <ButtonGroup>
//         <Button
//           variant={view === 'list' ? 'default' : 'outline'}
//           size='icon'
//           onClick={() => onViewChange('list')}
//         >
//           <List />
//         </Button>

//         <Button
//           variant={view === 'kanban' ? 'default' : 'outline'}
//           size='icon'
//           onClick={() => onViewChange('kanban')}
//         >
//           <LayoutGrid />
//         </Button>

//         <Button
//           variant={view === 'tree' ? 'default' : 'outline'}
//           size='icon'
//           onClick={() => onViewChange('tree')}
//         >
//           <GitBranch />
//         </Button>

//         <Button
//           variant={view === 'hierarchy' ? 'default' : 'outline'}
//           size='icon'
//           onClick={() => onViewChange('hierarchy')}
//         >
//           <Network />
//         </Button>
//       </ButtonGroup>
//     </div>
//   )
// }

'use client'

import { LayoutGrid, List, Network, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmployeeView } from '../../types/employee-view.types'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'

interface Props {
  view: EmployeeView
  onViewChange: (view: EmployeeView) => void
}

const views = [
  { value: 'list', icon: List },
  { value: 'kanban', icon: LayoutGrid },
  { value: 'tree', icon: GitBranch },
  { value: 'hierarchy', icon: Network },
] as const

export function EmployeeViewSwitcher({ view, onViewChange }: Props) {
  return (
    <div className='w-full overflow-x-auto sm:w-auto'>
      <ButtonGroup className='w-full sm:w-auto'>
        {views.map((item) => {
          const Icon = item.icon
          const active = view === item.value

          return (
            <Button
              key={item.value}
              variant={active ? 'default' : 'outline'}
              size='icon'
              onClick={() => onViewChange(item.value)}
              className={cn(
                'h-10 min-w-10 rounded-xl transition-all',
                active && 'shadow-sm',
              )}
            >
              <Icon className='h-4 w-4' />
            </Button>
          )
        })}
      </ButtonGroup>
    </div>
  )
}
