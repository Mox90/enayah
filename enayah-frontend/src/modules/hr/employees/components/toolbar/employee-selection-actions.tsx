'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import {
  Download,
  Printer,
  MoreHorizontal,
  FileSpreadsheet,
  FileText,
  File,
  Mail,
  UserRoundCog,
  UserMinus,
  UserX,
  Eye,
  FilePenLine,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  selectedIds: string[]
}

export function EmployeeSelectionActions({ selectedIds }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('common')
  if (selectedIds.length === 0) {
    return null
  }

  const singleSelected = selectedIds.length === 1

  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm font-medium'>
        {selectedIds.length} {t('selected')}
      </span>

      {/* --------------------- */}
      {/* Export */}
      {/* --------------------- */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            {t('export')}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start'>
          <DropdownMenuItem
            onClick={() => {
              console.log('Export Excel', selectedIds)
            }}
          >
            <FileSpreadsheet className='mr-2 h-4 w-4' />
            {t('excel')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Export CSV', selectedIds)
            }}
          >
            <File className='mr-2 h-4 w-4' />
            {t('csv')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Export PDF', selectedIds)
            }}
          >
            <FileText className='mr-2 h-4 w-4' />
            {t('pdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --------------------- */}
      {/* Print */}
      {/* --------------------- */}

      <Button
        variant='outline'
        onClick={() => {
          console.log('Print', selectedIds)
        }}
      >
        <Printer className='mr-2 h-4 w-4' />
        {t('print')}
      </Button>

      {/* --------------------- */}
      {/* Bulk Actions */}
      {/* --------------------- */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <MoreHorizontal className='mr-2 h-4 w-4' />
            {t('actions')}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          {singleSelected && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/${locale}/employees/${selectedIds[0]}/profile`)
                }
              >
                <Eye className='mr-2 h-4 w-4' />
                {t('profile')}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/${locale}/contracts/new?employeeId=${selectedIds[0]}`,
                  )
                }
              >
                <FilePenLine className='mr-2 h-4 w-4' />
                {t('amendContract')}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={() => {
              console.log('Assign Training', selectedIds)
            }}
          >
            <UserRoundCog className='mr-2 h-4 w-4' />
            {t('assignTraining')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Send Email', selectedIds)
            }}
          >
            <Mail className='mr-2 h-4 w-4' />
            {t('sendEmail')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Deactivate', selectedIds)
            }}
          >
            <UserMinus className='mr-2 h-4 w-4' />
            {t('deactivate')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Terminate', selectedIds)
            }}
          >
            <UserX className='mr-2 h-4 w-4' />
            {t('terminate')}
          </DropdownMenuItem>

          {/* <DropdownMenuItem
            onClick={() => {
              console.log('Amend Contract', selectedIds)
            }}
          >
            <UserX className='mr-2 h-4 w-4' />
            Amend Contract
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
