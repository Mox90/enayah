'use client'

import { GitBranch, LayoutGrid, List, Network } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { EmployeeView } from '../../types/employee-view.types'
import { useTranslations } from 'next-intl'

interface Props {
  view: EmployeeView
  onViewChange: (view: EmployeeView) => void
}

const views = [
  {
    value: 'list',
    label: 'List View',
    icon: List,
  },
  {
    value: 'kanban',
    label: 'Kanban View',
    icon: LayoutGrid,
  },
  {
    value: 'tree',
    label: 'Tree View',
    icon: GitBranch,
  },
  {
    value: 'hierarchy',
    label: 'Organizational View',
    icon: Network,
  },
] as const satisfies ReadonlyArray<{
  value: EmployeeView
  label: string
  icon: typeof List
}>

export function EmployeeViewSwitcher({ view, onViewChange }: Props) {
  const t = useTranslations('tooltip')
  return (
    <TooltipProvider delayDuration={300}>
      <div className='w-full overflow-x-auto sm:w-auto'>
        <div dir='ltr' className='inline-flex'>
          <ButtonGroup
            className={cn(
              'w-fit',
              'w-full sm:w-auto',
              '[&>button:first-child]:rounded-l-xl',
              '[&>button:last-child]:rounded-r-xl',
            )}
          >
            {views.map((item) => {
              const Icon = item.icon
              const active = view === item.value

              return (
                <Tooltip key={item.value}>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant={active ? 'default' : 'outline'}
                      size='icon'
                      aria-label={item.label}
                      aria-pressed={active}
                      onClick={() => onViewChange(item.value)}
                      className={cn(
                        'h-10 min-w-10 rounded-xl transition-all',
                        active && 'shadow-sm',
                      )}
                    >
                      <Icon className='h-4 w-4' aria-hidden='true' />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side='bottom' sideOffset={1}>
                    {/* <p>{t(item.label)}</p> */}
                    <p>{t(item.value)}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </ButtonGroup>
        </div>
      </div>
    </TooltipProvider>
  )
}
