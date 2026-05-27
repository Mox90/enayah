'use client'

import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>

  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <Input
        placeholder={searchPlaceholder ?? 'Search...'}
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
        className='max-w-sm'
      />

      <DataTableViewOptions table={table} />
    </div>
  )
}
