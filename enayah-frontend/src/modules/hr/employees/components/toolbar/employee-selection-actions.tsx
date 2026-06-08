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
} from 'lucide-react'

interface Props {
  selectedIds: string[]
}

export function EmployeeSelectionActions({ selectedIds }: Props) {
  if (selectedIds.length === 0) {
    return null
  }

  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm font-medium'>{selectedIds.length} Selected</span>

      {/* --------------------- */}
      {/* Export */}
      {/* --------------------- */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start'>
          <DropdownMenuItem
            onClick={() => {
              console.log('Export Excel', selectedIds)
            }}
          >
            <FileSpreadsheet className='mr-2 h-4 w-4' />
            Excel
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Export CSV', selectedIds)
            }}
          >
            <File className='mr-2 h-4 w-4' />
            CSV
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Export PDF', selectedIds)
            }}
          >
            <FileText className='mr-2 h-4 w-4' />
            PDF
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
        Print
      </Button>

      {/* --------------------- */}
      {/* Bulk Actions */}
      {/* --------------------- */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <MoreHorizontal className='mr-2 h-4 w-4' />
            Actions
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => {
              console.log('Assign Training', selectedIds)
            }}
          >
            <UserRoundCog className='mr-2 h-4 w-4' />
            Assign Training
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Send Email', selectedIds)
            }}
          >
            <Mail className='mr-2 h-4 w-4' />
            Send Email
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Deactivate', selectedIds)
            }}
          >
            <UserMinus className='mr-2 h-4 w-4' />
            Deactivate
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log('Terminate', selectedIds)
            }}
          >
            <UserX className='mr-2 h-4 w-4' />
            Terminate
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
