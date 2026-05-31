'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { usePositionItems } from '../hooks/use-position-items'
import { getPositionItemColumns } from './position-item-columns'
import { DataTable } from '@/components/tables'

export function PositionItemsTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('itemNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const t = useTranslations('positionItems')
  const locale = useLocale()

  const { data, isLoading } = usePositionItems({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  })

  const columns = getPositionItemColumns(sortBy, sortOrder, locale, {
    itemNumber: t('itemNumber'),
    department: t('departmentTitle'),
    position: t('positionTitle'),
    categoryCode: t('categoryCode'),
    status: t('status'),
    actions: t('actions'),
  })

  //console.log(data)

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      total={data?.meta.total ?? 0}
      pageCount={data?.meta.totalPages ?? 0}
      isLoading={isLoading}
      searchPlaceholder={t('searchPositionItem')}
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
