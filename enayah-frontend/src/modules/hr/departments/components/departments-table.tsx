'use client'

import { useState } from 'react'
import { DataTable } from '@/components/tables'
import { useDepartments } from '../hooks/use-departments'
import { getDepartmentColumns } from './department-columns'

export function DepartmentsTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('code')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { data, isLoading } = useDepartments({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  })

  const columns = getDepartmentColumns(sortBy, sortOrder)

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      total={data?.meta.total ?? 0}
      pageCount={data?.meta.totalPages ?? 0}
      isLoading={isLoading}
      searchPlaceholder='Search departments...'
      page={page}
      limit={limit}
      search={search}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onPageChange={setPage}
      onLimitChange={setLimit}
      onSearchChange={(value) => {
        setPage(1)
        setSearch(value)
      }}
      onSortChange={(sortBy, sortOrder) => {
        setPage(1)
        setSortBy(sortBy)
        setSortOrder(sortOrder)
      }}
    />
  )
}
