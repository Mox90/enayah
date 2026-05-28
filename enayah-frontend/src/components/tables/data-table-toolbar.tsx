'use client'

import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchColumnId?: string
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  searchColumnId, //searchColumnId = 'name',
}: DataTableToolbarProps<TData>) {
  const searchColumn = searchColumnId
    ? table.getColumn(searchColumnId)
    : undefined
  return (
    <div className='flex items-center justify-between gap-4'>
      {/* <Input
        placeholder={searchPlaceholder ?? 'Search...'}
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
        className='max-w-sm'
      /> */}
      {searchColumn ? (
        <Input
          placeholder={searchPlaceholder ?? 'Search...'}
          value={(searchColumn.getFilterValue() as string) ?? ''}
          onChange={(event) => searchColumn.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
      ) : null}

      <DataTableViewOptions table={table} />
    </div>
  )
}
