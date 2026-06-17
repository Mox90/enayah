'use client'

import { ColumnDef } from '@tanstack/react-table'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'
import { useLocale, useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/tables'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function useEmployeeColumns(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): ColumnDef<EmployeeDirectoryRow>[] {
  const t = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return [
    {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },

    {
      accessorKey: 'employeeNumber',
      meta: {
        label: t('employeeNumber'),
      },
      header: ({ column }) => (
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <DataTableColumnHeader
            column={column}
            title={t('employeeNumber')}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      ),
    },

    {
      id: 'fullName',
      meta: {
        label: t('fullName'),
      },
      header: t('fullName'),
      cell: ({ row }) => {
        const e = row.original
        const name = isRtl
          ? [e.firstNameAr, e.secondNameAr, e.thirdNameAr, e.familyNameAr]
          : [e.firstNameEn, e.secondNameEn, e.thirdNameEn, e.familyNameEn]
        return name.filter(Boolean).join(' ')
      },
    },

    {
      //accessorKey: 'departmentNameEn',
      accessorFn: (row) =>
        isRtl
          ? (row.departmentNameAr ?? row.departmentNameEn)
          : row.departmentNameEn,
      meta: {
        label: t('department'),
      },
      header: t('department'),
    },

    {
      //accessorKey: 'positionTitleEn',
      accessorFn: (row) =>
        isRtl
          ? (row.positionTitleAr ?? row.positionTitleEn)
          : row.positionTitleEn,
      meta: {
        label: t('position'),
      },
      header: t('position'),
    },

    {
      accessorKey: 'pcn',
      meta: {
        label: t('pcn'),
      },
      header: t('pcn'),
    },

    {
      accessorKey: 'categoryCode',
      meta: {
        label: t('category'),
      },
      header: t('category'),
      cell: ({ row }) => (
        <Badge variant='secondary'>
          {/* {row.original.categoryCode !== null
            ? row.original.categoryCode
            : 'N/A'} */}
          {row.original.categoryCode !== null ? row.original.categoryCode : '-'}
        </Badge>
      ),
    },

    {
      accessorKey: 'gender',
      meta: {
        label: t('gender'),
      },
      header: t('gender'),
      cell: ({ row }) => {
        const gender = row.original.gender

        const genderClass: Record<string, string> = {
          male: 'bg-blue-100 text-blue-700 border-blue-200',
          female: 'bg-pink-100 text-pink-700 border-pink-200',
        }

        return (
          <Badge variant='outline' className={genderClass[gender] ?? ''}>
            {gender === 'male' ? t('male') : t('female')}
          </Badge>
        )
      },
    },

    {
      //accessorKey: 'nationalityEn',
      accessorFn: (row) =>
        isRtl ? (row.nationalityAr ?? row.nationalityEn) : row.nationalityEn,
      meta: {
        label: t('nationality'),
      },
      header: t('nationality'),
    },

    {
      accessorKey: 'hireDate',
      meta: {
        label: t('hireDate'),
      },
      header: t('hireDate'),
      // cell: ({ row }) =>
      //   row.original.hireDate ? format(new Date(row.original.hireDate), 'dd-MMM-yyyy')
      //     : '-',
      cell: ({ row }) => {
        const raw = row.original.hireDate
        if (!raw) return '-'
        const parsed = new Date(raw)
        return Number.isNaN(parsed.getTime())
          ? '-'
          : format(parsed, 'dd-MMM-yyyy')
      },
    },

    {
      accessorKey: 'employmentStatus',
      meta: {
        label: t('status'),
      },
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.employmentStatus

        const statusClass: Record<string, string> = {
          active: 'bg-green-100 text-green-700 border-green-200',
          terminated: 'bg-red-100 text-red-700 border-red-200',
          resigned: 'bg-orange-100 text-orange-700 border-orange-200',
          retired: 'bg-purple-100 text-purple-700 border-purple-200',
          suspended: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          deceased: 'bg-gray-100 text-gray-700 border-gray-200',
        }

        return (
          <Badge variant='outline' className={statusClass[status ?? ''] ?? ''}>
            {status?.replaceAll('_', ' ') ?? '-'}
          </Badge>
        )
      },
    },
  ]
}
