// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-selection-actions.tsx

'use client'

import {
  ChevronDown,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Printer,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  selectedIds: string[]
  onOpen: (id: string) => void
}

export function IqamaRenewalSelectionActions({ selectedIds, onOpen }: Props) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('common')
  const it = useTranslations('iqamaRenewal')

  if (selectedIds.length === 0) {
    return null
  }

  const singleSelected = selectedIds.length === 1

  const compactSelectedCount =
    selectedIds.length > 9 ? '9+' : String(selectedIds.length)

  return (
    <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
      {/* Selected count */}
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
      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
            aria-label={t('export')}
            title={t('export')}
          >
            <Download className='h-4 w-4 shrink-0' />

            <span className='ms-2 hidden md:inline'>{t('export')}</span>

            <ChevronDown className='ms-1.5 hidden h-4 w-4 opacity-60 md:block' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className='w-44'>
          <DropdownMenuItem
            onClick={() => console.log('Export Iqama Excel', selectedIds)}
          >
            <FileSpreadsheet className='me-2 h-4 w-4' />
            {t('excel')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Export Iqama CSV', selectedIds)}
          >
            <File className='me-2 h-4 w-4' />
            {t('csv')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Export Iqama PDF', selectedIds)}
          >
            <FileText className='me-2 h-4 w-4' />
            {t('pdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* Actions */}
      {singleSelected && (
        <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
              aria-label={t('actions')}
              title={t('actions')}
            >
              <MoreHorizontal className='h-4 w-4 shrink-0' />

              <span className='ms-2 hidden md:inline'>{t('actions')}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-52'>
            <DropdownMenuItem onClick={() => onOpen(selectedIds[0]!)}>
              <Eye className='me-2 h-4 w-4' />

              {it('open')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
