// enayah-frontend/src/modules/hr/employees/components/employee-workspace.tsx

'use client'

import { useEffect, useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

import type { EmployeeView } from '../types/employee-view.types'
import { useEmployeeDirectory } from '../hooks/use-employee-directory'

import { EmployeeToolbar } from './toolbar/employee-toolbar'
import { EmployeesTable } from './list/employees-table'
import { EmployeeKanbanView } from './kanban/employee-kanban-view'
import { EmployeeTreeView } from './tree/employee-tree-view'
//import { EmployeeHierarchyView } from './hierarchy/employee-hierarchy-view'
import { EmployeeFilterSheet } from './filter/employee-filter-sheet'
import { OnboardingForm } from './onboarding/onboarding-form'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEmployeeWorkspaceNavigation } from '../../onboarding/hooks/use-employee-workspace-navigation'
import { useOnboardingDraftStore } from '../../onboarding/stores/onboarding-draft.store'

type EmployeeFilters = {
  departmentIds: string[]
  positionIds: string[]
  categoryCodes: number[]
  genders: string[]
  nationalities: string[]
  employmentStatuses: string[]

  hireDateFrom?: string
  hireDateTo?: string

  contractEndDateFrom?: string
  contractEndDateTo?: string
}

export function EmployeeWorkspace() {
  //const [view, setView] = useState<EmployeeView>('list')
  //const [mode, setMode] = useState<'directory' | 'onboarding'>('directory')
  // const router = useRouter()
  // const pathname = usePathname()
  // const searchParams = useSearchParams()

  // const mode =
  //   searchParams.get('mode') === 'onboarding' ? 'onboarding' : 'directory'
  // const viewParam = searchParams.get('view')
  // const view: EmployeeView =
  //   viewParam === 'kanban' || viewParam === 'tree' ? viewParam : 'list'
  // const updateWorkspaceQuery = (
  //   updates: Record<string, string | null | undefined>,
  // ) => {
  //   const params = new URLSearchParams(searchParams.toString())

  //   Object.entries(updates).forEach(([key, value]) => {
  //     if (value === null || value === undefined || value === '') {
  //       params.delete(key)
  //     } else {
  //       params.set(key, value)
  //     }
  //   })

  //   const query = params.toString()

  //   router.replace(query ? `${pathname}?${query}` : pathname, {
  //     scroll: false,
  //   })
  // }

  const { mode, view, setView, openOnboarding, closeOnboarding } =
    useEmployeeWorkspaceNavigation()

  const resetOnboardingDraft = useOnboardingDraftStore(
    (state) => state.resetDraft,
  )

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)

  /*
   * searchInput:
   * Immediate value displayed in the input.
   *
   * debouncedSearch:
   * Delayed value sent to the backend.
   */
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [sortBy, setSortBy] = useState('employeeNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState<EmployeeFilters>({
    departmentIds: [],
    positionIds: [],
    categoryCodes: [],
    genders: [],
    nationalities: [],
    employmentStatuses: [],

    hireDateFrom: undefined,
    hireDateTo: undefined,

    contractEndDateFrom: undefined,
    contractEndDateTo: undefined,
  })

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  /*
   * Wait 400 milliseconds after the user stops typing
   * before applying the search to the API request.
   */
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

  const offset = (page - 1) * limit

  const { data, isLoading } = useEmployeeDirectory({
    offset,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    ...filters,
  })

  if (mode === 'onboarding') {
    return (
      <OnboardingForm
        onCancel={() => {
          resetOnboardingDraft()
          closeOnboarding()
        }}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <EmployeeToolbar
        view={view}
        selectedIds={Object.keys(rowSelection)}
        onViewChange={setView}
        onBoard={() => {
          resetOnboardingDraft()
          openOnboarding()
        }}
        onFilter={() => setFilterOpen(true)}
      />

      <EmployeeFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onApply={(newFilters: EmployeeFilters) => {
          setFilters({
            departmentIds: newFilters.departmentIds ?? [],
            positionIds: newFilters.positionIds ?? [],
            categoryCodes: newFilters.categoryCodes ?? [],
            genders: newFilters.genders ?? [],
            nationalities: newFilters.nationalities ?? [],
            employmentStatuses: newFilters.employmentStatuses ?? [],

            hireDateFrom: newFilters.hireDateFrom,
            hireDateTo: newFilters.hireDateTo,

            contractEndDateFrom: newFilters.contractEndDateFrom,
            contractEndDateTo: newFilters.contractEndDateTo,
          })

          setPage(1)
          setRowSelection({})
          setFilterOpen(false)
        }}
        onReset={() => {
          setFilters({
            departmentIds: [],
            positionIds: [],
            categoryCodes: [],
            genders: [],
            nationalities: [],
            employmentStatuses: [],

            hireDateFrom: undefined,
            hireDateTo: undefined,

            contractEndDateFrom: undefined,
            contractEndDateTo: undefined,
          })

          setPage(1)
          setRowSelection({})
          setFilterOpen(false)
        }}
      />

      {view === 'list' && (
        <EmployeesTable
          data={data}
          isLoading={isLoading}
          page={page}
          limit={limit}
          search={searchInput}
          sortBy={sortBy}
          sortOrder={sortOrder}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onPageChange={setPage}
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

      {view === 'kanban' && (
        <EmployeeKanbanView
          employees={data?.items ?? []}
          isLoading={isLoading}
        />
      )}

      {view === 'tree' && <EmployeeTreeView />}

      {/* {view === 'hierarchy' && <EmployeeHierarchyView />} */}
    </div>
  )
}
