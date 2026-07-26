// enayah-frontend/src/modules/hr/iqama-renewal/components/list/iqama-renewal-table.tsx

'use client'

import { DataTable } from '@/components/tables'
import { useTranslations } from 'next-intl'

//import type { IqamaRenewalCaseListResponse } from '../../types/iqama-renewal.types'
import { useIqamaRenewalColumns } from './use-iqama-renewal-columns'
import { IqamaRenewalCaseListResponse } from '../types/iqama-renewal.types'
import { IqamaRenewalSortBy } from '../services/iqama-renewal.service'

interface Props {
  data?: IqamaRenewalCaseListResponse
  isLoading: boolean

  page: number
  limit: number
  search: string
  sortBy: IqamaRenewalSortBy
  sortOrder: 'asc' | 'desc'

  onOpen: (id: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (value: string) => void
  onSortChange: (sortBy: IqamaRenewalSortBy, sortOrder: 'asc' | 'desc') => void
}

function isIqamaRenewalSortBy(value: string): value is IqamaRenewalSortBy {
  return (
    value === 'createdAt' ||
    value === 'updatedAt' ||
    value === 'status' ||
    value === 'governmentRelationsDueDate'
  )
}

export function IqamaRenewalTable({
  data,
  isLoading,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  onOpen,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onSortChange,
}: Props) {
  const t = useTranslations('iqamaRenewal')

  return (
    <DataTable
      columns={useIqamaRenewalColumns(sortBy, sortOrder, onOpen)}
      data={data?.data ?? []}
      total={data?.pagination?.total ?? 0}
      pageCount={data?.pagination?.totalPages ?? 0}
      isLoading={isLoading}
      page={page}
      limit={limit}
      search={search}
      sortBy={sortBy}
      sortOrder={sortOrder}
      searchPlaceholder={t('searchPlaceholder')}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      onSearchChange={onSearchChange}
      onSortChange={(nextSortBy, nextSortOrder) => {
        if (!isIqamaRenewalSortBy(nextSortBy)) {
          console.error(`Unsupported Iqama sort field: ${nextSortBy}`)
          return
        }

        onSortChange(nextSortBy, nextSortOrder)
      }}
    />
  )
}
