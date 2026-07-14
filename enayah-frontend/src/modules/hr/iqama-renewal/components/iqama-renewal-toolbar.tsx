// src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-toolbar.tsx

'use client'

import { FilePlus2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IqamaRenewalView } from '../types/iqama-renewal.types'
import { IqamaRenewalViewSwitcher } from './iqama-renewal-view-switcher'

//import type { IqamaRenewalView } from '../../types/iqama-renewal-view.types'
//import { IqamaRenewalViewSwitcher } from './iqama-renewal-view-switcher'

interface Props {
  view: IqamaRenewalView
  onViewChange: (view: IqamaRenewalView) => void
  onCreate?: () => void
}

export function IqamaRenewalToolbar({ view, onViewChange, onCreate }: Props) {
  const t = useTranslations('iqamaRenewal')

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur',
        'flex flex-col gap-3',
        'lg:flex-row lg:items-center lg:justify-between',
      )}
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Button
          type='button'
          onClick={onCreate}
          className='h-10 rounded-xl shadow-sm'
        >
          <FilePlus2 className='mr-2 h-4 w-4' />
          <span className='truncate'>{t('createProcess')}</span>
        </Button>
      </div>

      <div className='flex justify-start lg:justify-end'>
        <IqamaRenewalViewSwitcher view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
