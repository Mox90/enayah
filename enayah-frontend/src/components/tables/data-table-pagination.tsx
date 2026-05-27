'use client'

import { Table } from '@tanstack/react-table'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface DataTablePaginationProps<TData> {
  table: Table<TData>

  total?: number
}

export function DataTablePagination<TData>({
  table,
  total,
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-between'>
      <div className='text-sm text-muted-foreground'>
        {total ?? 0} total records
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          aria-label='Previous Page'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <Button
          variant='outline'
          size='icon'
          aria-label='Next Page'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight aria-hidden='true' className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
