import { ColumnDef } from '@tanstack/react-table'
import { PositionItem } from '../types/position.item.types'
import { DataTableColumnHeader } from '@/components/tables'
import { PositionItemActions } from './position-item-action'
import { getStatusVariant } from '@/utils/utilities'
import { Badge } from '@/components/ui/badge'

type PositionItemColumns = {
  itemNumber: string
  department: string
  position: string
  categoryCode: string
  status: string
  actions: string
}

export const getPositionItemColumns = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  locale: string,
  labels: PositionItemColumns,
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
    //cell: ({ row }) => row.original.department?.nameEn ?? '-',
    cell: ({ row }) =>
      locale === 'ar'
        ? row.original.departmentNameAr
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
    //cell: ({ row }) => row.original.position?.titleEn ?? '-',
    cell: ({ row }) =>
      locale === 'ar'
        ? row.original.positionTitleAr
        : row.original.positionTitleEn,
  },
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
  },
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
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={getStatusVariant(row.original.status)}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    meta: {
      label: labels.actions,
    },
    header: () => <div className='text-center'>{labels.actions}</div>,
    cell: ({ row }) => {
      const positionItem = row.original

      return <PositionItemActions positionItem={positionItem} />
    },
  },
]
