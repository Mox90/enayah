'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Department } from '../types/department.types'

import { DataTableColumnHeader } from '@/components/tables'

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
  },

  {
    accessorKey: 'nameEn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='English Name' />
    ),
  },

  {
    accessorKey: 'nameAr',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Arabic Name' />
    ),
  },
]
