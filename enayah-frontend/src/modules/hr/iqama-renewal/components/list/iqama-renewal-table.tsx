// enayah-frontend/src/modules/hr/iqama-renewal/components/list/iqama-renewal-table.tsx

'use client'

import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table'
import { DataTable } from '@/components/tables'
import { useTranslations } from 'next-intl'
import { useIqamaRenewalColumns } from './use-iqama-renewal-columns'
import type { IqamaRenewalCaseListResponse } from '../../types/iqama-renewal.types'
import {
  isIqamaRenewalSortBy,
  type IqamaRenewalSortBy,
} from '../../services/iqama-renewal.service'

interface Props {
  data?: IqamaRenewalCaseListResponse
  isLoading: boolean
  page: number
  limit: number
  search: string
  sortBy: IqamaRenewalSortBy
  sortOrder: 'asc' | 'desc'
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onOpen: (id: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (value: string) => void
  onSortChange: (sortBy: IqamaRenewalSortBy, sortOrder: 'asc' | 'desc') => void
}

export function IqamaRenewalTable({
  data,
  isLoading,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  rowSelection,
  onRowSelectionChange,
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
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
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
