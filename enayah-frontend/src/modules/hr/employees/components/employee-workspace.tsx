'use client'

import { useState } from 'react'
import { RowSelectionState } from '@tanstack/react-table'

import { EmployeeView } from '../types/employee-view.types'
import { useEmployeeDirectory } from '../hooks/use-employee-directory'

import { EmployeeToolbar } from './toolbar/employee-toolbar'
import { EmployeesTable } from './list/employees-table'
import { EmployeeKanbanView } from './kanban/employee-kanban-view'
import { EmployeeTreeView } from './tree/employee-tree-view'
import { EmployeeHierarchyView } from './hierarchy/employee-hierarchy-view'
import { EmployeeFilterSheet } from './filter/employee-filter-sheet'

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
  const [view, setView] = useState<EmployeeView>('list')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('employeeNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterOpen, setFilterOpen] = useState(false)
  // const [departmentIds, setDepartmentIds] = useState<string[]>([])
  // const [positionIds, setPositionIds] = useState<string[]>([])
  // const [categoryCodes, setCategoryCodes] = useState<number[]>([])
  // const [genders, setGenders] = useState<string[]>([])
  // const [nationalities, setNationalities] = useState<string[]>([])
  // const [employmentStatuses, setEmploymentStatuses] = useState<string[]>([])
  const [filters, setFilters] = useState<EmployeeFilters>({
    departmentIds: [] as string[],
    positionIds: [] as string[],
    categoryCodes: [] as number[],
    genders: [] as string[],
    nationalities: [] as string[],
    employmentStatuses: [] as string[],

    hireDateFrom: undefined,
    hireDateTo: undefined,

    contractEndDateFrom: undefined,
    contractEndDateTo: undefined,
  })

  //------------------------------------
  // IMPORTANT
  //------------------------------------

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const offset = (page - 1) * limit
  const { data, isLoading } = useEmployeeDirectory({
    offset,
    limit,
    search,
    sortBy,
    sortOrder,
    ...filters,
  })

  return (
    <div className='space-y-4'>
      <EmployeeToolbar
        view={view}
        selectedIds={Object.keys(rowSelection)}
        onViewChange={setView}
        onFilter={() => setFilterOpen(true)}
      />

      {/* Filter Sheet */}
      <EmployeeFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onApply={(newFilters: any) => {
          setFilters({
            departmentIds: newFilters.departmentIds ?? [],
            positionIds: newFilters.positionIds ?? [],
            categoryCodes: (newFilters.categoryCodes ?? []).map((x: string) =>
              Number(x),
            ),
            genders: newFilters.genders ?? [],
            nationalities: newFilters.nationalities ?? [],
            employmentStatuses: newFilters.employmentStatuses ?? [],

            hireDateFrom: newFilters.hireDateFrom,
            hireDateTo: newFilters.hireDateTo,

            contractEndDateFrom: newFilters.contractEndDateFrom,
            contractEndDateTo: newFilters.contractEndDateTo,
          })
          setPage(1)
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
          setFilterOpen(false)
        }}
      />

      {view === 'list' && (
        <EmployeesTable
          data={data}
          isLoading={isLoading}
          page={page}
          limit={limit}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onSearchChange={setSearch}
          onSortChange={(sortBy, sortOrder) => {
            setSortBy(sortBy)
            setSortOrder(sortOrder)
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

      {view === 'hierarchy' && <EmployeeHierarchyView />}
    </div>
  )
}
