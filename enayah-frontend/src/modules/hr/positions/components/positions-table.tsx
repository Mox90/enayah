'use client'

import { useState } from 'react'
import { usePositions } from '../hooks/use-positions'
import { getPositionColumns } from './position-columns'
import { DataTable } from '@/components/tables'
import { useTranslations } from 'next-intl'

export function PositionsTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('titleEn')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const t = useTranslations('positions')

  const { data, isLoading } = usePositions({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  })

  const columns = getPositionColumns(sortBy, sortOrder, {
    titleEn: t('englishTitle'),
    titleAr: t('arabicTitle'),
    actions: t('actions'),
  })

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      total={data?.meta.total ?? 0}
      pageCount={data?.meta.totalPages ?? 0}
      isLoading={isLoading}
      searchPlaceholder={t('searchPosition')}
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
