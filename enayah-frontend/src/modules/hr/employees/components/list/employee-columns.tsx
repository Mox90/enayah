'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
//import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'
import { DataTableColumnHeader } from '@/components/tables'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const genderClass: Record<string, string> = {
  male: 'bg-blue-100 text-blue-700 border-blue-200',
  female: 'bg-pink-100 text-pink-700 border-pink-200',
}

const genderLabel: Record<string, string> = {
  male: 'Male',
  female: 'Female',
}

export function employeeColumns(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): ColumnDef<EmployeeDirectoryRow>[] {
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
        label: 'Employee #',
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Employee #'
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      ),
    },
    {
      id: 'fullName',
      meta: {
        label: 'Full Name',
      },
      header: 'Full Name',
      cell: ({ row }) => {
        const e = row.original
        return [e.firstNameEn, e.secondNameEn, e.thirdNameEn, e.familyNameEn]
          .filter(Boolean)
          .join(' ')
      },
    },
    {
      accessorKey: 'departmentNameEn',
      meta: {
        label: 'Department',
      },
      header: 'Department',
    },
    {
      accessorKey: 'positionTitleEn',
      meta: {
        label: 'Position',
      },
      header: 'Position',
    },
    {
      accessorKey: 'pcn',
      meta: {
        label: 'PCN',
      },
      header: 'PCN',
    },
    {
      accessorKey: 'categoryCode',
      meta: {
        label: 'Category',
      },
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant='secondary'>
          {row.original.categoryCode !== null
            ? row.original.categoryCode
            : 'N/A'}
        </Badge>
      ),
    },
    {
      accessorKey: 'gender',
      meta: {
        label: 'Gender',
      },
      header: 'Gender',

      cell: ({ row }) => {
        const gender = row.original.gender

        const genderClass: Record<string, string> = {
          male: 'bg-blue-100 text-blue-700 border-blue-200',
          female: 'bg-pink-100 text-pink-700 border-pink-200',
        }

        return (
          <Badge variant='outline' className={genderClass[gender] ?? ''}>
            {gender.charAt(0).toUpperCase() + gender.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'nationalityEn',
      meta: {
        label: 'Nationality',
      },
      header: 'Nationality',
    },
    {
      accessorKey: 'hireDate',
      meta: {
        label: 'Hire Date',
      },
      header: 'Hire Date',

      cell: ({ row }) => {
        return row.original.hireDate
          ? format(new Date(row.original.hireDate), 'dd-MMM-yyyy')
          : '-'
      },
    },
    {
      accessorKey: 'employmentStatus',
      meta: {
        label: 'Status',
      },
      header: 'Status',

      cell: ({ row }) => {
        const status = row.original.employmentStatus

        // if (!status) {
        //   return <Badge variant='outline'>N/A</Badge>
        // }

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
