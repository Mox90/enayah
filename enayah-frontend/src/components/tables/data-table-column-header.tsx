'use client'

import { Column } from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string

  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  sortBy,
  sortOrder,
}: DataTableColumnHeaderProps<TData, TValue>) {
  //const sorted = column.getIsSorted()
  const isSortedColumn = sortBy === column.id
  //console.log('HEADER', title, sorted)

  return (
    <button
      type='button'
      className='flex items-center gap-2'
      onClick={() => column.toggleSorting()}
    >
      {title}

      {!isSortedColumn ? (
        <ChevronsUpDown className='h-4 w-4' />
      ) : sortOrder === 'asc' ? (
        <ArrowUp className='h-4 w-4' />
      ) : (
        <ArrowDown className='h-4 w-4' />
      )}
    </button>
  )
}
