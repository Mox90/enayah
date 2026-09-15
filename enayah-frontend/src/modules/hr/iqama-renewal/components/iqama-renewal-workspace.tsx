// enayah-frontend/src/modules/hr/iqama-renewal/components/iqama-renewal-workspace.tsx

'use client'

import { useEffect, useState } from 'react'

import type { RowSelectionState } from '@tanstack/react-table'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  createEmptyIqamaRenewalFilters,
  type IqamaRenewalFilters,
  type IqamaRenewalView,
} from '../types/iqama-renewal.types'

import type { IqamaRenewalSortBy } from '../services/iqama-renewal.service'

import { useIqamaRenewalProcesses } from '../hooks/use-iqama-renewal-processes'

import { useIqamaRenewalAccess } from '../hooks/use-iqama-renewal-access'

import { IqamaRenewalForm } from './iqama-renewal-form'

import { IqamaRenewalToolbar } from './toolbar/iqama-renewal-toolbar'

import { IqamaRenewalFilterSheet } from './filter/iqama-renewal-filter-sheet'

import { IqamaRenewalTable } from './list/iqama-renewal-table'

export function IqamaRenewalWorkspace() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const access = useIqamaRenewalAccess()

  //--------------------------------
  // View / mode
  //--------------------------------

  const [view, setView] = useState<IqamaRenewalView>('list')

  const requestedView = searchParams.get('view')

  const mode = requestedView === 'form' ? 'form' : 'directory'

  const selectedCaseId = mode === 'form' ? searchParams.get('caseId') : null

  //--------------------------------
  // Paging
  //--------------------------------

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)

  //--------------------------------
  // Search
  //--------------------------------

  const [searchInput, setSearchInput] = useState('')

  const [debouncedSearch, setDebouncedSearch] = useState('')

  //--------------------------------
  // Sorting
  //--------------------------------

  const [sortBy, setSortBy] = useState<IqamaRenewalSortBy>('createdAt')

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  //--------------------------------
  // Filters
  //--------------------------------

  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState<IqamaRenewalFilters>(
    createEmptyIqamaRenewalFilters,
  )

  //--------------------------------
  // Selection
  //--------------------------------

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selectedCaseIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  )

  //--------------------------------
  // Debounced search
  //--------------------------------

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)

      setDebouncedSearch(searchInput.trim())

      setRowSelection({})
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchInput])

  //--------------------------------
  // Directory API
  //--------------------------------

  const { data, isLoading, isError, error } = useIqamaRenewalProcesses({
    page,
    limit,

    search: debouncedSearch,

    status: filters.statuses.length > 0 ? filters.statuses : undefined,

    expiryDateFrom: filters.expiryDateFrom ?? null,

    expiryDateTo: filters.expiryDateTo ?? null,

    mhrsdUploadedFrom: filters.mhrsdUploadedFrom ?? null,

    mhrsdUploadedTo: filters.mhrsdUploadedTo ?? null,

    mhrsdApprovedFrom: filters.mhrsdApprovedFrom ?? null,

    mhrsdApprovedTo: filters.mhrsdApprovedTo ?? null,

    mhrsdDeniedFrom: filters.mhrsdDeniedFrom ?? null,

    mhrsdDeniedTo: filters.mhrsdDeniedTo ?? null,

    governmentRelationsDueFrom: filters.governmentRelationsDueFrom ?? null,

    governmentRelationsDueTo: filters.governmentRelationsDueTo ?? null,

    sortBy,
    sortOrder,
  })

  //--------------------------------
  // Selected cases
  //--------------------------------

  const cases = data?.data ?? []

  const selectedCases = cases.filter(
    (renewalCase) => rowSelection[renewalCase.id],
  )

  //--------------------------------
  // API error
  //--------------------------------

  useEffect(() => {
    if (!isError) {
      return
    }

    console.error('Iqama renewal request failed:', error)
  }, [isError, error])

  //--------------------------------
  // Navigation
  //--------------------------------

  function openForm(caseId?: string) {
    const params = new URLSearchParams(searchParams.toString())

    params.set('view', 'form')

    if (caseId) {
      params.set('caseId', caseId)
    } else {
      params.delete('caseId')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  function closeForm() {
    const params = new URLSearchParams(searchParams.toString())

    params.delete('view')
    params.delete('caseId')

    const query = params.toString()

    router.push(query ? `${pathname}?${query}` : pathname)
  }

  //--------------------------------
  // Directory helpers
  //--------------------------------

  function clearSelection() {
    setRowSelection({})
  }

  function resetDirectoryPage() {
    setPage(1)
    clearSelection()
  }

  function applyFilters(nextFilters: IqamaRenewalFilters) {
    setFilters(nextFilters)

    resetDirectoryPage()

    setFilterOpen(false)
  }

  function resetFilters() {
    setFilters(createEmptyIqamaRenewalFilters())

    resetDirectoryPage()

    setFilterOpen(false)
  }

  //--------------------------------
  // Form mode
  //--------------------------------

  if (mode === 'form') {
    return (
      <IqamaRenewalForm
        key={selectedCaseId ?? 'create'}
        caseId={selectedCaseId}
        access={access}
        onCancel={closeForm}
        onSaved={closeForm}
      />
    )
  }

  //--------------------------------
  // Directory
  //--------------------------------

  return (
    <div className='space-y-4'>
      <IqamaRenewalToolbar
        view={view}
        selectedIds={selectedCaseIds}
        selectedCases={selectedCases}
        access={access}
        onViewChange={setView}
        onCreate={() => openForm()}
        onFilter={() => setFilterOpen(true)}
        onOpen={openForm}
      />

      <IqamaRenewalFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {view === 'list' && (
        <IqamaRenewalTable
          data={data}
          isLoading={isLoading}
          page={page}
          limit={limit}
          search={searchInput}
          sortBy={sortBy}
          sortOrder={sortOrder}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onOpen={openForm}
          onPageChange={(nextPage) => {
            setPage(nextPage)

            clearSelection()
          }}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit)

            resetDirectoryPage()
          }}
          onSearchChange={setSearchInput}
          onSortChange={(nextSortBy, nextSortOrder) => {
            setSortBy(nextSortBy)

            setSortOrder(nextSortOrder)

            resetDirectoryPage()
          }}
        />
      )}
    </div>
  )
}
