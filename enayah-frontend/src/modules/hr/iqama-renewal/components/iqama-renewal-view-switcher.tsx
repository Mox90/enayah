// src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-view-switcher.tsx

'use client'

import { LayoutGrid, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'
import { IqamaRenewalView } from '../types/iqama-renewal.types'
import { useTranslations } from 'next-intl'

//import type { IqamaRenewalView } from '../../types/iqama-renewal-view.types'

interface Props {
  view: IqamaRenewalView
  onViewChange: (view: IqamaRenewalView) => void
}

const views = [
  {
    value: 'list',
    icon: List,
    label: 'List view',
  },
  {
    value: 'kanban',
    icon: LayoutGrid,
    label: 'Kanban view',
  },
] as const

export function IqamaRenewalViewSwitcher({ view, onViewChange }: Props) {
  const t = useTranslations('iqamaRenewal')
  return (
    <div className='w-full overflow-x-auto sm:w-auto'>
      <div dir='ltr' className='inline-flex'>
        {/* <ButtonGroup className='w-full sm:w-auto'> */}
        <ButtonGroup
          className={cn(
            'w-fit',
            '[&>button:first-child]:rounded-l-xl',
            '[&>button:last-child]:rounded-r-xl',
            'w-full sm:w-auto',
          )}
        >
          {views.map((item) => {
            const Icon = item.icon
            const active = view === item.value
            //console.log(item.label)

            return (
              <Button
                key={item.value}
                type='button'
                variant={active ? 'default' : 'outline'}
                size='icon'
                aria-label={item.label}
                title={item.label}
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
    </div>
  )
}
