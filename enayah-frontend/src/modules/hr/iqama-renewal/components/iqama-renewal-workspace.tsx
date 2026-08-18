// enayah-frontend/src/modules/hr/iqama-renewal/components/list/iqama-renewal-table.tsx

'use client'

import { useEffect, useState } from 'react'

import type { RowSelectionState } from '@tanstack/react-table'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useAuthStore } from '@/modules/iam/stores/auth.store'
import {
  createEmptyIqamaRenewalFilters,
  type IqamaRenewalFilters,
  type IqamaRenewalView,
} from '../types/iqama-renewal.types'
import { IqamaRenewalSortBy } from '../services/iqama-renewal.service'
import { useIqamaRenewalProcesses } from '../hooks/use-iqama-renewal-processes'
import { IqamaRenewalForm } from './iqama-renewal-form'
import { IqamaRenewalToolbar } from './toolbar/iqama-renewal-toolbar'
import { IqamaRenewalFilterSheet } from './filter/iqama-renewal-filter-sheet'
import { IqamaRenewalTable } from './list/iqama-renewal-table'

// import {
//   createEmptyIqamaRenewalFilters,
//   type IqamaRenewalFilters,
//   type IqamaRenewalView,
// } from '../../types/iqama-renewal.types'

// import { useIqamaRenewalProcesses } from '../../hooks/use-iqama-renewal-processes'

// import type { IqamaRenewalSortBy } from '../../services/iqama-renewal.service'

// import { IqamaRenewalTable } from './iqama-renewal-table'

// import { IqamaRenewalToolbar } from '../toolbar/iqama-renewal-toolbar'

// import { IqamaRenewalFilterSheet } from '../filter/iqama-renewal-filter-sheet'

// import { IqamaRenewalForm } from '../iqama-renewal-form'

export function IqamaRenewalWorkspace() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  //--------------------------------
  // View / mode
  //--------------------------------

  const [view, setView] = useState<IqamaRenewalView>('list')
  const caseIdFromUrl = searchParams.get('caseId')
  const requestedView = searchParams.get('view')
  const mode = requestedView === 'form' ? 'form' : 'directory'
  const selectedCaseId = mode === 'form' ? caseIdFromUrl : null

  //--------------------------------
  // Permissions
  //--------------------------------

  const canManageWorkflow =
    user?.roles?.some((role) => role.name === 'HR_ADMIN') ?? false
  const canProcessGovernmentRelations =
    user?.roles?.some((role) => role.name === 'HR_GOVERNMENT_RELATION') ?? false
  const canCommentOnCase =
    user?.roles?.some((role) =>
      ['HR_ADMIN', 'HR_GOVERNMENT_RELATION', 'HR_DIRECTOR'].includes(role.name),
    ) ?? false

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
  const selectedCaseIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected === true)
    .map(([id]) => id)

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
  // API
  //--------------------------------

  const { data, isLoading, isError, error } = useIqamaRenewalProcesses({
    page,
    limit,
    search: debouncedSearch,
    //--------------------------------
    // Filters
    //--------------------------------
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    expiryDateFrom: filters.expiryDateFrom,
    expiryDateTo: filters.expiryDateTo,
    mhrsdUploadedFrom: filters.mhrsdUploadedFrom,
    mhrsdUploadedTo: filters.mhrsdUploadedTo,
    mhrsdApprovedFrom: filters.mhrsdApprovedFrom,
    mhrsdApprovedTo: filters.mhrsdApprovedTo,
    mhrsdDeniedFrom: filters.mhrsdDeniedFrom,
    mhrsdDeniedTo: filters.mhrsdDeniedTo,
    governmentRelationsDueFrom: filters.governmentRelationsDueFrom,
    governmentRelationsDueTo: filters.governmentRelationsDueTo,

    //--------------------------------
    // Sorting
    //--------------------------------
    sortBy,
    sortOrder,
  })

  if (isError) {
    console.error('Iqama renewal request failed:', error)
  }

  //--------------------------------
  // Form navigation
  //--------------------------------

  function openCreateForm() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'form')
    params.delete('caseId')
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

  //--------------------------------
  // Form mode
  //--------------------------------

  if (mode === 'form') {
    return (
      <IqamaRenewalForm
        key={selectedCaseId ?? 'create'}
        caseId={selectedCaseId}
        onCancel={closeForm}
        onSaved={closeForm}
        canManageWorkflow={canManageWorkflow}
        canCommentOnCase={canCommentOnCase}
        canProcessGovernmentRelations={canProcessGovernmentRelations}
        currentUserId={user?.id ?? null}
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
        onViewChange={setView}
        onCreate={openCreateForm}
        onFilter={() => setFilterOpen(true)}
        onOpen={openExistingCase}
      />

      <IqamaRenewalFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onApply={(nextFilters) => {
          setFilters(nextFilters)
          setPage(1)
          setRowSelection({})
          setFilterOpen(false)
        }}
        onReset={() => {
          setFilters(createEmptyIqamaRenewalFilters())
          setPage(1)
          setRowSelection({})
          setFilterOpen(false)
        }}
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
          onOpen={openExistingCase}
          onPageChange={(nextPage) => {
            setPage(nextPage)
            setRowSelection({})
          }}
          onLimitChange={(nextLimit) => {
            setPage(1)
            setLimit(nextLimit)
            setRowSelection({})
          }}
          onSearchChange={setSearchInput}
          onSortChange={(nextSortBy, nextSortOrder) => {
            setPage(1)
            setSortBy(nextSortBy)
            setSortOrder(nextSortOrder)
            setRowSelection({})
          }}
        />
      )}
    </div>
  )
}

// 'use client'

// import { useEffect, useState } from 'react'
// import { useSearchParams, useRouter, usePathname } from 'next/navigation' // Added hooks
// import { IqamaRenewalView } from '../types/iqama-renewal.types'
// import { useIqamaRenewalProcesses } from '../hooks/use-iqama-renewal-processes'
// import { IqamaRenewalTable } from './list/iqama-renewal-table'
// import { IqamaRenewalToolbar } from './toolbar/iqama-renewal-toolbar'
// import type { IqamaRenewalSortBy } from '../services/iqama-renewal.service'
// import { IqamaRenewalForm } from './iqama-renewal-form'
// import { useAuthStore } from '@/modules/iam/stores/auth.store'

// export function IqamaRenewalWorkspace() {
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const pathname = usePathname()

//   const [view, setView] = useState<IqamaRenewalView>('list')

//   const user = useAuthStore((state) => state.user)

//   // 1. Derive state directly from searchParams (No useEffect needed)
//   const caseIdFromUrl = searchParams.get('caseId')
//   const requestedView = searchParams.get('view')

//   const mode = requestedView === 'form' ? 'form' : 'directory'
//   const canManageWorkflow =
//     user?.roles?.some((role) => role.name === 'HR_ADMIN') ?? false
//   const canProcessGovernmentRelations =
//     user?.roles?.some((role) => role.name === 'HR_GOVERNMENT_RELATION') ?? false
//   const canCommentOnCase =
//     user?.roles?.some((role) =>
//       ['HR_ADMIN', 'HR_GOVERNMENT_RELATION', 'HR_DIRECTOR'].includes(role.name),
//     ) ?? false
//   const selectedCaseId = mode === 'form' ? caseIdFromUrl : null

//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(25)
//   const [searchInput, setSearchInput] = useState('')
//   const [debouncedSearch, setDebouncedSearch] = useState('')
//   const [sortBy, setSortBy] = useState<IqamaRenewalSortBy>('createdAt')
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

//   useEffect(() => {
//     const timeoutId = window.setTimeout(() => {
//       setPage(1)
//       setDebouncedSearch(searchInput.trim())
//     }, 400)

//     return () => {
//       window.clearTimeout(timeoutId)
//     }
//   }, [searchInput])

//   const { data, isLoading, isError, error } = useIqamaRenewalProcesses({
//     page,
//     limit,
//     search: debouncedSearch,
//     sortBy,
//     sortOrder,
//   })

//   if (isError) {
//     console.error('Iqama renewal request failed:', error)
//   }

//   // 2. Update the URL instead of local state to switch modes
//   function openCreateForm() {
//     const params = new URLSearchParams(searchParams.toString())
//     params.set('view', 'form')
//     params.delete('caseId') // Clear previous if creating new
//     router.push(`${pathname}?${params.toString()}`)
//   }

//   function openExistingCase(id: string) {
//     const params = new URLSearchParams(searchParams.toString())
//     params.set('view', 'form')
//     params.set('caseId', id)
//     router.push(`${pathname}?${params.toString()}`)
//   }

//   function closeForm() {
//     const params = new URLSearchParams(searchParams.toString())
//     params.delete('view')
//     params.delete('caseId')
//     router.push(`${pathname}?${params.toString()}`)
//   }

//   if (mode === 'form') {
//     return (
//       <IqamaRenewalForm
//         key={selectedCaseId ?? 'create'}
//         caseId={selectedCaseId}
//         onCancel={closeForm}
//         onSaved={closeForm}
//         canManageWorkflow={canManageWorkflow}
//         canCommentOnCase={canCommentOnCase}
//         canProcessGovernmentRelations={canProcessGovernmentRelations}
//         currentUserId={user?.id ?? null}
//         //governmentRelationsUsers={[]}
//       />
//     )
//   }

//   return (
//     <div className='space-y-4'>
//       <IqamaRenewalToolbar
//         view={view}
//         onViewChange={setView}
//         onCreate={openCreateForm}
//       />

//       {view === 'list' && (
//         <IqamaRenewalTable
//           data={data}
//           isLoading={isLoading}
//           page={page}
//           limit={limit}
//           search={searchInput}
//           sortBy={sortBy}
//           sortOrder={sortOrder}
//           onOpen={openExistingCase}
//           onPageChange={setPage}
//           onLimitChange={setLimit}
//           // onSearchChange={(value) => {
//           //   setPage(1)
//           //   setSearch(value)
//           // }}
//           onSearchChange={setSearchInput}
//           onSortChange={(nextSortBy, nextSortOrder) => {
//             setPage(1)
//             setSortBy(nextSortBy)
//             setSortOrder(nextSortOrder)
//           }}
//         />
//       )}

//       {/* {view === 'kanban' && (
//         <IqamaRenewalKanbanView
//           cases={data?.data ?? []}
//           isLoading={isLoading}
//           onOpen={openExistingCase}
//         />
//       )} */}
//     </div>
//   )
// }
