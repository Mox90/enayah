'use client'

import * as React from 'react'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { DataTableEmpty } from './data-table-empty'
import { DataTableSkeleton } from './data-table-skeleton'
import { useLocale } from 'next-intl'
import { EmployeeDirectoryRow } from '@/modules/hr/employees/types/employee-directory.types'
import {
  EmploymentStatus,
  employmentStatusStyles,
} from '@/modules/hr/employees/components/list/use-employee-columns'
import { cn } from '@/lib/utils'

interface DataTableSelectionProps {
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

interface DataTableProps<
  TData extends { id: string },
  TValue,
> extends DataTableSelectionProps {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  total?: number
  pageCount?: number
  isLoading?: boolean

  searchPlaceholder?: string

  page: number
  limit: number
  search: string

  sortBy: string
  sortOrder: 'asc' | 'desc'

  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (value: string) => void

  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  // rowSelection and onRowSelectionChange are provided by DataTableSelectionProps
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  total = 0,
  pageCount = 0,
  isLoading = false,
  searchPlaceholder,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({})

  //const [rowSelection, setRowSelection] = React.useState({})

  const sorting: SortingState = [
    {
      id: sortBy,
      desc: sortOrder === 'desc',
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnVisibility,
      rowSelection: rowSelection ?? internalRowSelection,
    },
    enableRowSelection: true,
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater

      if (newSorting.length > 0) {
        onSortChange(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })
  const locale = useLocale()
  const isRtl = locale === 'ar'
  //console.log('TABLE SORTING', table.getState().sorting)
  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        search={search}
        onSearchChange={onSearchChange}
      />

      <div className='rounded-xl border'>
        <Table dir={isRtl ? 'rtl' : 'ltr'}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={isRtl ? 'text-right' : 'text-left'}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={columns.length} />
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // table.getRowModel().rows.map((row) => {
              //   const original = row.original as EmployeeDirectoryRow

              //   const status = original.employmentStatus as
              //     | EmploymentStatus
              //     | null
              //     | undefined

              //   const statusConfig =
              //     status && status in employmentStatusStyles
              //       ? employmentStatusStyles[status]
              //       : null

              //   return (
              //     <TableRow
              //       key={row.id}
              //       data-state={row.getIsSelected() && 'selected'}
              //       className={cn(
              //         'transition-colors duration-150',
              //         statusConfig?.rowClassName,

              //         row.getIsSelected() &&
              //           'bg-primary/10 hover:bg-primary/15',
              //       )}
              //     >
              //       {row.getVisibleCells().map((cell) => (
              //         <TableCell key={cell.id}>
              //           {flexRender(
              //             cell.column.columnDef.cell,
              //             cell.getContext(),
              //           )}
              //         </TableCell>
              //       ))}
              //     </TableRow>
              //   )
              // })
              <DataTableEmpty columns={columns.length} />
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        pageCount={pageCount}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  )
}
