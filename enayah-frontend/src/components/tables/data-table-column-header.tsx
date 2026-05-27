'use client'

import { Column } from '@tanstack/react-table'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props<TData, TValue> {
  column: Column<TData, TValue>

  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: Props<TData, TValue>) {
  return (
    <Button
      variant='ghost'
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className='px-0 hover:bg-transparent'
    >
      {title}

      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className='ml-2 h-4 w-4' />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className='ml-2 h-4 w-4' />
      ) : (
        <ArrowUpDown className='ml-2 h-4 w-4' />
      )}
    </Button>
  )
}
