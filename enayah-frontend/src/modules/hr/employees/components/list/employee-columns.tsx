'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
//import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'
import { DataTableColumnHeader } from '@/components/tables'
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
    },
    {
      accessorKey: 'gender',
      meta: {
        label: 'Gender',
      },
      header: 'Gender',
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
    },
    {
      accessorKey: 'employmentStatus',
      meta: {
        label: 'Status',
      },
      header: 'Status',
    },
  ]
}
