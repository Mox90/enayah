// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-toolbar.tsx

'use client'

import { FilePlus2, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import type { IqamaRenewalView } from '../../types/iqama-renewal.types'

import { IqamaRenewalViewSwitcher } from '../iqama-renewal-view-switcher'
import { IqamaRenewalSelectionActions } from './iqama-renewal-selection-actions'

interface Props {
  view: IqamaRenewalView
  selectedIds: string[]
  onViewChange: (view: IqamaRenewalView) => void
  onCreate?: () => void
  onFilter?: () => void
  onOpen: (id: string) => void
}

export function IqamaRenewalToolbar({
  view,
  selectedIds,
  onViewChange,
  onCreate,
  onFilter,
  onOpen,
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const ct = useTranslations('common')

  return (
    <div className='rounded-2xl border bg-card/80 p-2.5 shadow-sm backdrop-blur'>
      <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
        {/* Create */}
        <Button
          type='button'
          onClick={onCreate}
          size='icon'
          className='h-10 w-10 shrink-0 rounded-xl sm:w-auto sm:px-4'
          aria-label={t('createProcess')}
          title={t('createProcess')}
        >
          <FilePlus2 className='h-4 w-4 shrink-0' />

          <span className='ms-2 hidden sm:inline'>{t('createProcess')}</span>
        </Button>

        {/* Filter */}
        <Button
          type='button'
          variant='outline'
          onClick={onFilter}
          size='icon'
          className='h-10 w-10 shrink-0 rounded-xl sm:w-auto sm:px-4'
          aria-label={ct('filter')}
          title={ct('filter')}
        >
          <Filter className='h-4 w-4 shrink-0' />

          <span className='ms-2 hidden sm:inline'>{ct('filter')}</span>
        </Button>

        {/* Selected actions */}
        <IqamaRenewalSelectionActions
          selectedIds={selectedIds}
          onOpen={onOpen}
        />

        {/* Push switcher to opposite edge */}
        <div className='ms-auto shrink-0'>
          <IqamaRenewalViewSwitcher view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}
