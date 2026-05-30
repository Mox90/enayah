'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Department } from '../types/department.types'
import { DataTableColumnHeader } from '@/components/tables'
import { DepartmentActions } from './department-actions'

type DepartmentColumns = {
  code: string
  nameEn: string
  nameAr: string
  actions: string
}

export const getDepartmentColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  labels: DepartmentColumns,
): ColumnDef<Department>[] => [
  {
    accessorKey: 'code',
    meta: {
      label: labels.code,
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.code}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'nameEn',
    meta: {
      label: labels.nameEn,
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.nameEn}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'nameAr',
    meta: {
      label: labels.nameAr,
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.nameAr}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    id: 'actions',
    meta: {
      label: labels.actions,
    },
    header: () => <div className='text-center'>{labels.actions}</div>,
    cell: ({ row }) => {
      const department = row.original

      return <DepartmentActions department={department} />
    },
  },
]
