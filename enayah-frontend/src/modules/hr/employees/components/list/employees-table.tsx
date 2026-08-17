// enayah-frontend/src/modules/hr/employees/components/list/employee-table.tsx

'use client'

import { RowSelectionState, OnChangeFn } from '@tanstack/react-table'

import { DataTable } from '@/components/tables'

import { EmployeeDirectoryResponse } from '../../types/employee-directory.types'
import { useEmployeeColumns } from './use-employee-columns'
import { useTranslations } from 'next-intl'

//import { employeeColumns } from './employee-columns'

interface Props {
  data?: EmployeeDirectoryResponse
  isLoading: boolean
  page: number
  limit: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (value: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function EmployeesTable({
  data,
  isLoading,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  rowSelection,
  onRowSelectionChange,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onSortChange,
}: Props) {
  const t = useTranslations('employees')
  return (
    <DataTable
      columns={useEmployeeColumns(sortBy, sortOrder)}
      data={data?.items ?? []}
      total={data?.total ?? 0}
      pageCount={limit > 0 ? Math.ceil((data?.total ?? 0) / limit) : 0}
      isLoading={isLoading}
      page={page}
      limit={limit}
      search={search}
      sortBy={sortBy}
      sortOrder={sortOrder}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      searchPlaceholder={t('searchEmployee')}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      onSearchChange={onSearchChange}
      onSortChange={onSortChange}
    />
  )
}
