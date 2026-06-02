'use client'

import { useState } from 'react'

import { EmployeeView } from '../types/employee-view.types'

import { EmployeeToolbar } from './toolbar/employee-toolbar'

import { EmployeesTable } from './list/employees-table'
import { EmployeeKanbanView } from './kanban/employee-kanban-view'
import { EmployeeTreeView } from './tree/employee-tree-view'
import { EmployeeHierarchyView } from './hierarchy/employee-hierarchy-view'
import { useEmployeesByRange } from '../hooks/use-employees'

export function EmployeeWorkspace() {
  const [view, setView] = useState<EmployeeView>('list')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const [range, setRange] = useState({
    start: 1,
    end: 10,
  })

  const offset = range.start - 1
  const limit = range.end - range.start + 1
  const { data, isLoading } = useEmployeesByRange({
    offset,
    limit,
  })

  //console.log(data)

  return (
    <div className='space-y-4'>
      <EmployeeToolbar
        view={view}
        onViewChange={setView}
        selectedCount={selectedEmployees.length}
        range={range}
        total={data?.total ?? 0}
        onRangeChange={setRange}
      />

      {view === 'list' && (
        <EmployeesTable employees={data?.items ?? []} isLoading={isLoading} />
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
