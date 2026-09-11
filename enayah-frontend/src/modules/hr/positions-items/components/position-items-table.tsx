// enayah-frontend/src/modules/hr/positions-items/components/position-items-table.tsx

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { DataTable } from '@/components/tables'
import { usePositionItems } from '../hooks/use-position-items'
import { getPositionItemColumns } from './position-item-columns'

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

  //console.log('data', data)

  // const columns = getPositionItemColumns(sortBy, sortOrder, locale, {
  //   itemNumber: t('itemNumber'),
  //   department: t('departmentTitle'),
  //   position: t('positionTitle'),
  //   workforceCategory: t('workforceCategory'),
  //   categoryCode: t('categoryCode'),
  //   status: t('status'),
  //   actions: t('actions'),

  //   statusVacant: t('vacant'),
  //   statusReserved: t('reserved'),
  //   statusFilled: t('filled'),
  //   statusFrozen: t('frozen'),
  // })
  const columns = getPositionItemColumns(
    sortBy,
    sortOrder,
    locale,
    {
      itemNumber: t('itemNumber'),
      department: t('departmentTitle'),
      position: t('positionTitle'),
      workforceCategory: t('workforceCategory'),
      categoryCode: t('categoryCode'),
      status: t('status'),
      actions: t('actions'),
    },
    (status) => t(status),
  )

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
      onSortChange={(nextSortBy, nextSortOrder) => {
        setPage(1)
        setSortBy(nextSortBy)
        setSortOrder(nextSortOrder)
      }}
    />
  )
}
