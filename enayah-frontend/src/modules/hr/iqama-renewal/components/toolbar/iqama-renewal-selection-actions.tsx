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

  return (
    <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center'>
      <div className='flex h-10 items-center rounded-xl border bg-muted/40 px-3 text-sm font-medium'>
        {selectedIds.length} {t('selected')}
      </div>

      <div className='grid grid-cols-2 gap-2 sm:flex sm:items-center'>
        <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='h-10 rounded-xl'>
              <Download className='mr-2 h-4 w-4' />

              {t('export')}

              <ChevronDown className='ml-2 h-4 w-4 opacity-60' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='start' className='w-44'>
            <DropdownMenuItem
              onClick={() => console.log('Export Iqama Excel', selectedIds)}
            >
              <FileSpreadsheet className='mr-2 h-4 w-4' />
              {t('excel')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log('Export Iqama CSV', selectedIds)}
            >
              <File className='mr-2 h-4 w-4' />
              {t('csv')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log('Export Iqama PDF', selectedIds)}
            >
              <FileText className='mr-2 h-4 w-4' />
              {t('pdf')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant='outline'
          className='h-10 rounded-xl'
          onClick={() => console.log('Print Iqama cases', selectedIds)}
        >
          <Printer className='mr-2 h-4 w-4' />
          {t('print')}
        </Button>

        {singleSelected && (
          <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='col-span-2 h-10 rounded-xl sm:col-span-1'
              >
                <MoreHorizontal className='mr-2 h-4 w-4' />

                {t('actions')}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuItem onClick={() => onOpen(selectedIds[0]!)}>
                <Eye className='mr-2 h-4 w-4' />

                {it('open')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
