'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Position } from '../types/position.types'
import { DataTableColumnHeader } from '@/components/tables'
import { PositionActions } from './position-actions'

type PositionColumnLabels = {
  titleEn: string
  titleAr: string
  actions: string
}

export const getPositionColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  labels: PositionColumnLabels,
): ColumnDef<Position>[] => [
  {
    accessorKey: 'titleEn',
    meta: {
      label: labels.titleEn,
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.titleEn}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),
  },
  {
    accessorKey: 'titleAr',
    meta: {
      label: labels.titleAr,
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.titleAr}
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
      const position = row.original

      return <PositionActions position={position} />
    },
  },
]
