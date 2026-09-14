// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-selection-actions.tsx

'use client'

import { Printer } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import type { IqamaRenewalCase } from '../../types/iqama-renewal.types'

import type { IqamaRenewalAccess } from '../../hooks/use-iqama-renewal-access'

import { IqamaRenewalExportMenu } from './iqama-renewal-export-menu'

import { IqamaRenewalQuickWorkflowMenu } from './iqama-renewal-quick-workflow-menu'

interface Props {
  selectedIds: string[]
  selectedCases: IqamaRenewalCase[]

  access: IqamaRenewalAccess

  onOpen: (id: string) => void
}

export function IqamaRenewalSelectionActions({
  selectedIds,
  selectedCases,
  access,
  onOpen,
}: Props) {
  const t = useTranslations('common')

  if (selectedIds.length === 0) {
    return null
  }

  const selectedCase =
    selectedIds.length === 1
      ? (selectedCases.find(
          (renewalCase) => renewalCase.id === selectedIds[0],
        ) ?? null)
      : null

  const compactSelectedCount =
    selectedIds.length > 9 ? '+9' : String(selectedIds.length)

  return (
    <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
      {/* Selected */}

      <div
        className='flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40 px-2 text-sm font-medium sm:px-3'
        title={`${selectedIds.length} ${t('selected')}`}
      >
        <span className='sm:hidden'>{compactSelectedCount}</span>

        <span className='hidden whitespace-nowrap sm:inline'>
          {selectedIds.length} {t('selected')}
        </span>
      </div>

      {/* Export */}

      <IqamaRenewalExportMenu selectedCases={selectedCases} />

      {/* Print */}

      <Button
        type='button'
        variant='outline'
        size='icon'
        className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
        onClick={() => console.log('Print Iqama cases', selectedIds)}
        aria-label={t('print')}
        title={t('print')}
      >
        <Printer className='h-4 w-4 shrink-0' />

        <span className='ms-2 hidden md:inline'>{t('print')}</span>
      </Button>

      {/* Quick workflow */}

      {selectedCase && (
        <IqamaRenewalQuickWorkflowMenu
          renewalCase={selectedCase}
          access={access}
          onOpen={onOpen}
        />
      )}
    </div>
  )
}
