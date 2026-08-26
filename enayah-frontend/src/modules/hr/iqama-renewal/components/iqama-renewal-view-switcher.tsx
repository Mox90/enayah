// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-view-switcher.tsx

'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'

import type { IqamaRenewalView } from '../types/iqama-renewal.types'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Props {
  view: IqamaRenewalView
  onViewChange: (view: IqamaRenewalView) => void
}

const views = [
  {
    value: 'list',
    icon: List,
  },
  {
    value: 'kanban',
    icon: LayoutGrid,
  },
] as const

export function IqamaRenewalViewSwitcher({ view, onViewChange }: Props) {
  const t = useTranslations('tooltip')

  const isList = view === 'list'

  /*
   * On mobile, show the OTHER view as the action.
   *
   * If currently List:
   *   show Grid icon -> clicking switches to Kanban.
   *
   * If currently Kanban:
   *   show List icon -> clicking switches to List.
   */
  const mobileTargetView: IqamaRenewalView = isList ? 'kanban' : 'list'

  const MobileIcon = isList ? LayoutGrid : List

  return (
    <TooltipProvider delayDuration={300}>
      {/* ================================================== */}
      {/* Mobile */}
      {/* ================================================== */}

      <div className='sm:hidden'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-10 w-10 shrink-0 rounded-xl'
              aria-label={t(mobileTargetView)}
              onClick={() => onViewChange(mobileTargetView)}
            >
              <MobileIcon className='h-4 w-4' aria-hidden='true' />
            </Button>
          </TooltipTrigger>

          <TooltipContent side='bottom' sideOffset={4}>
            <p>{t(mobileTargetView)}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* ================================================== */}
      {/* Tablet / Desktop */}
      {/* ================================================== */}

      <div dir='ltr' className='hidden shrink-0 sm:inline-flex'>
        <ButtonGroup
          className={cn(
            'w-fit',
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
                    aria-label={t(item.value)}
                    onClick={() => onViewChange(item.value)}
                    className={cn(
                      'h-10 w-10 shrink-0 transition-colors',
                      active && 'shadow-sm',
                    )}
                  >
                    <Icon className='h-4 w-4' aria-hidden='true' />
                  </Button>
                </TooltipTrigger>

                <TooltipContent side='bottom' sideOffset={4}>
                  <p>{t(item.value)}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </ButtonGroup>
      </div>
    </TooltipProvider>
  )
}
