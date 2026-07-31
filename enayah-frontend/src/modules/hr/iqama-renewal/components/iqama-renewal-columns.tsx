// enayah-frontend/src/modules/hr/iqama-renewal/components/iqama-renewal-columns.tsx

'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/tables'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { IqamaRenewalSortBy } from '../services/iqama-renewal.service'
import type { IqamaRenewalCase } from '../types/iqama-renewal.types'
import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'
import { formatDate, toPersianDigits } from '@/utils/utilities'

type Labels = {
  employeeNumber: string
  employeeName: string
  iqamaNumber: string
  expiryDate: string
  currentStage: string
  assignedTo: string
  uploadDate: string
  decision: string
  governmentRelationsDueDate: string
  daysRemaining: string
  actions: string
  open: string
  approved: string
  denied: string
  pending: string
  overdue: string
  days: string
}

// function formatDate(value?: string | null) {
//   if (!value) return '-'

//   const date = new Date(value)

//   if (Number.isNaN(date.getTime())) {
//     return '-'
//   }

//   return new Intl.DateTimeFormat('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   }).format(date)
// }

function calculateDaysRemaining(value?: string | null) {
  if (!value) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(value)

  if (Number.isNaN(dueDate.getTime())) {
    return null
  }

  dueDate.setHours(0, 0, 0, 0)

  return Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
}

function getMhrsdDecision(
  status: IqamaRenewalCase['status'],
): 'approved' | 'denied' | 'pending' {
  if (
    status === 'approved_by_mhrsd' ||
    status === 'sent_to_government_relations' ||
    status === 'completed'
  ) {
    return 'approved'
  }

  if (status === 'denied_by_mhrsd' || status === 'eoc_required') {
    return 'denied'
  }

  return 'pending'
}

export function getIqamaRenewalColumns(
  sortBy: IqamaRenewalSortBy,
  sortOrder: 'asc' | 'desc',
  labels: Labels,
  onOpen: (id: string) => void,
  isArabic: boolean,
): ColumnDef<IqamaRenewalCase>[] {
  return [
    {
      accessorKey: 'employeeNumber',
      //enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.employeeNumber}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>
          {isArabic
            ? toPersianDigits(row.original.employeeNumber)
            : (row.original.employeeNumber ?? '-')}
        </span>
      ),
    },

    {
      id: 'employeeName',
      accessorFn: (row) =>
        isArabic ? (row.employeeNameAr ?? '') : (row.employeeNameEn ?? ''),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.employeeName}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => {
        const employeeName = isArabic
          ? row.original.employeeNameAr
          : row.original.employeeNameEn

        return <span dir={isArabic ? 'rtl' : 'ltr'}>{employeeName ?? '-'}</span>
      },
    },

    {
      accessorKey: 'iqamaNumber',
      //enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.iqamaNumber}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) =>
        isArabic
          ? toPersianDigits(row.original.iqamaNumber)
          : (row.original.iqamaNumber ?? '-'),
    },

    {
      accessorKey: 'expiryDate',
      //enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.expiryDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) =>
        // isArabic
        //   ? toArabic(row.original.expiryDate, 1) || '-'
        //   : formatDate(row.original.expiryDate),
        formatDate(row.original.expiryDate, isArabic),
    },

    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.currentStage}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => (
        <IqamaRenewalStatusBadge status={row.original.status} />
      ),
    },

    {
      accessorKey: 'assignedToName',
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.assignedTo}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => row.original.assignedToName ?? '-',
    },

    {
      accessorKey: 'mhrsdUploadedAt',
      //enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.uploadDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => formatDate(row.original.mhrsdUploadedAt, isArabic),
    },

    {
      id: 'mhrsdDecision',
      accessorFn: (row) => getMhrsdDecision(row.status),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.decision}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => {
        const decision = getMhrsdDecision(row.original.status)

        if (decision === 'approved') {
          return labels.approved
        }

        if (decision === 'denied') {
          return labels.denied
        }

        return labels.pending
      },
    },

    {
      accessorKey: 'governmentRelationsDueDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.governmentRelationsDueDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) =>
        formatDate(row.original.governmentRelationsDueDate, isArabic),
    },

    {
      id: 'daysRemaining',
      accessorFn: (row) =>
        calculateDaysRemaining(row.governmentRelationsDueDate),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={labels.daysRemaining}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
      cell: ({ row }) => {
        const daysRemaining = calculateDaysRemaining(
          row.original.governmentRelationsDueDate,
        )

        if (daysRemaining === null) {
          return '-'
        }

        if (daysRemaining < 0) {
          return `${Math.abs(daysRemaining)} ${labels.days} ${labels.overdue}`
        }

        return `${daysRemaining} ${labels.days}`
      },
    },

    {
      id: 'actions',
      header: labels.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu dir={isArabic ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='h-4 w-4 text-green-700' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onOpen(row.original.id)}>
              <Pencil className='mr-2 h-4 w-4' />
              {labels.open}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
