'use client'

import { Table } from '@tanstack/react-table'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import { Settings2 } from 'lucide-react'

interface Props<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({ table }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings2 className='mr-2 h-4 w-4' />
          View
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column) => {
            const label =
              (
                column.columnDef.meta as {
                  label?: string
                }
              )?.label ?? column.id

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
