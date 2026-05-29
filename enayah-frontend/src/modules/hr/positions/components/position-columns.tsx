'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Position } from '../types/position.types'
import { DataTableColumnHeader } from '@/components/tables'
import { PositionActions } from './position-actions'

export const getPositionColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): ColumnDef<Position>[] => [
  {
    accessorKey: 'titleEn',
    meta: {
      label: 'English Title',
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='English Title'
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'titleAr',
    meta: {
      label: 'Arabic Title',
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Arabic Title'
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
      const position = row.original

      return <PositionActions position={position} />
    },
  },
]
