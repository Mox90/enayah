// enayah-frontend/src/modules/hr/positions-items/components/position-item-columns.tsx

'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/tables'
import { getStatusVariant, toArabicDigits } from '@/utils/utilities'

import type { PositionItem } from '../types/position.item.types'

import { PositionItemActions } from './position-item-action'

// type PositionItemColumns = {
//   itemNumber: string
//   department: string
//   position: string
//   workforceCategory: string
//   categoryCode: string
//   status: string
//   actions: string

//   statusVacant: string
//   statusReserved: string
//   statusFilled: string
//   statusFrozen: string
// }
type PositionItemColumns = {
  itemNumber: string
  department: string
  position: string
  workforceCategory: string
  categoryCode: string
  status: string
  actions: string
}

export const getPositionItemColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  locale: string,
  labels: PositionItemColumns,
  translateStatus: (status: PositionItem['status']) => string,
): ColumnDef<PositionItem>[] => [
  {
    accessorKey: 'itemNumber',
    meta: {
      label: labels.itemNumber,
    },

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.itemNumber}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),

    cell: ({ row }) => (
      <span className='font-mono font-medium tabular-nums'>
        {row.original.itemNumber}
      </span>
    ),
  },

  {
    accessorKey: 'departmentName',
    meta: {
      label: labels.department,
    },

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.department}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),

    cell: ({ row }) =>
      locale === 'ar'
        ? (row.original.departmentNameAr ?? row.original.departmentNameEn)
        : row.original.departmentNameEn,
  },

  {
    accessorKey: 'positionTitle',

    meta: {
      label: labels.position,
    },

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.position}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),

    cell: ({ row }) =>
      locale === 'ar'
        ? (row.original.positionTitleAr ?? row.original.positionTitleEn)
        : row.original.positionTitleEn,
  },

  // {
  //   accessorKey: 'workforceCategory',

  //   meta: {
  //     label: labels.workforceCategory,
  //   },

  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       column={column}
  //       title={labels.workforceCategory}
  //       sortBy={sortBy}
  //       sortOrder={sortOrder}
  //     />
  //   ),

  //   cell: ({ row }) => (
  //     <span className='text-sm'>{row.original.workforceCategory ?? '—'}</span>
  //   ),
  // },

  {
    accessorKey: 'categoryCode',
    meta: {
      label: labels.categoryCode,
    },

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.categoryCode}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),

    cell: ({ row }) => (
      <Badge variant='secondary'>
        {row.original.categoryCode === null
          ? '—'
          : locale === 'ar'
            ? toArabicDigits(row.original.categoryCode)
            : row.original.categoryCode}
      </Badge>
    ),
  },

  // {
  //   accessorKey: 'status',
  //   meta: {
  //     label: labels.status,
  //   },

  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       column={column}
  //       title={labels.status}
  //       sortBy={sortBy}
  //       sortOrder={sortOrder}
  //     />
  //   ),

  //   cell: ({ row }) => (
  //     <Badge
  //       variant='outline'
  //       className={getStatusVariant(row.original.status)}
  //     >
  //       {row.original.status}
  //     </Badge>
  //   ),
  // },

  {
    accessorKey: 'status',
    meta: {
      label: labels.status,
    },

    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={labels.status}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ),

    cell: ({ row }) => {
      const status = row.original.status

      // const statusLabels = {
      //   vacant: labels.statusVacant,
      //   reserved: labels.statusReserved,
      //   filled: labels.statusFilled,
      //   frozen: labels.statusFrozen,
      // } as const

      return (
        // <Badge variant='outline' className={getStatusVariant(status)}>
        //   {statusLabels[status] ?? status}
        // </Badge>
        <Badge variant='outline' className={getStatusVariant(status)}>
          {translateStatus(status)}
        </Badge>
      )
    },
  },
  {
    id: 'actions',

    meta: {
      label: labels.actions,
    },

    header: () => <div className='text-center'>{labels.actions}</div>,

    cell: ({ row }) => <PositionItemActions positionItem={row.original} />,
  },
]
