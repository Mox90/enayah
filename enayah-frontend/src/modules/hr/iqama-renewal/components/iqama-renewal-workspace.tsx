'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation' // Added hooks
import { IqamaRenewalView } from '../types/iqama-renewal.types'
import { useIqamaRenewalProcesses } from '../hooks/use-iqama-renewal-processes'
import { IqamaRenewalTable } from './iqama-renewal-table'
import { IqamaRenewalToolbar } from './iqama-renewal-toolbar'
import type { IqamaRenewalSortBy } from '../services/iqama-renewal.service'
import { IqamaRenewalForm } from './iqama-renewal-form'

export function IqamaRenewalWorkspace() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [view, setView] = useState<IqamaRenewalView>('list')

  // 1. Derive state directly from searchParams (No useEffect needed)
  const caseIdFromUrl = searchParams.get('caseId')
  const requestedView = searchParams.get('view')

  const mode = requestedView === 'form' ? 'form' : 'directory'

  const selectedCaseId = mode === 'form' ? caseIdFromUrl : null

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<IqamaRenewalSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { data, isLoading, isError, error } = useIqamaRenewalProcesses({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  })

  if (isError) {
    console.error('Iqama renewal request failed:', error)
  }

  //console.log('DATA is ', data)

  // 2. Update the URL instead of local state to switch modes
  function openCreateForm() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'form')
    params.delete('caseId') // Clear previous if creating new
    router.push(`${pathname}?${params.toString()}`)
  }

  function openExistingCase(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'form')
    params.set('caseId', id)
    router.push(`${pathname}?${params.toString()}`)
  }

  function closeForm() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('view')
    params.delete('caseId')
    router.push(`${pathname}?${params.toString()}`)
  }

  if (mode === 'form') {
    return (
      <IqamaRenewalForm
        key={selectedCaseId ?? 'create'}
        caseId={selectedCaseId}
        onCancel={closeForm}
        onSaved={closeForm}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <IqamaRenewalToolbar
        view={view}
        onViewChange={setView}
        onCreate={openCreateForm}
      />

      {view === 'list' && (
        <IqamaRenewalTable
          data={data}
          isLoading={isLoading}
          page={page}
          limit={limit}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onOpen={openExistingCase}
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
      )}

      {/* {view === 'kanban' && (
        <IqamaRenewalKanbanView
          cases={data?.data ?? []}
          isLoading={isLoading}
          onOpen={openExistingCase}
        />
      )} */}
    </div>
  )
}
