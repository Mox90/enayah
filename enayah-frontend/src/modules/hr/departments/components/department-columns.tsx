'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Department } from '../types/department.types'

import { DataTableColumnHeader } from '@/components/tables'
import { DepartmentActions } from './department-actions'

export const getDepartmentColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): ColumnDef<Department>[] => [
  {
    accessorKey: 'code',
    meta: {
      label: 'Code',
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Code'
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'nameEn',
    meta: {
      label: 'English Name',
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='English Name'
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'nameAr',
    meta: {
      label: 'Arabic Name',
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Arabic Name'
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    id: 'actions',
    meta: {
      label: 'Actions',
    },
    header: () => <div className='text-center'>Actions</div>,
    cell: ({ row }) => {
      const department = row.original

      return <DepartmentActions department={department} />
    },
  },
]
