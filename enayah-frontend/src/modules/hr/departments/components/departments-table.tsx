'use client'

import { DataTable } from '@/components/tables'
import { useDepartments } from '../hooks/use-departments'
import { departmentColumns } from './department-columns'

export function DepartmentsTable() {
  const { data, isLoading } = useDepartments()
  //console.log(data)
  return (
    <DataTable
      columns={departmentColumns}
      data={data ?? []}
      isLoading={isLoading}
      total={data?.length ?? 0}
      searchColumnId='nameEn'
      searchPlaceholder='Search departments...'
    />
  )
}
