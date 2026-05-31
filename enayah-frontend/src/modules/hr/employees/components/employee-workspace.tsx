'use client'

import { useState } from 'react'

import { EmployeeView } from '../types/employee-view.types'

import { EmployeeToolbar } from './toolbar/employee-toolbar'

import { EmployeesTable } from './list/employees-table'
import { EmployeeKanbanView } from './kanban/employee-kanban-view'
import { EmployeeTreeView } from './tree/employee-tree-view'
import { EmployeeHierarchyView } from './hierarchy/employee-hierarchy-view'

export function EmployeeWorkspace() {
  const [view, setView] = useState<EmployeeView>('list')

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  return (
    <div className='space-y-4'>
      <EmployeeToolbar
        view={view}
        onViewChange={setView}
        selectedCount={selectedEmployees.length}
      />

      {view === 'list' && (
        <EmployeesTable
        //selectedEmployees={selectedEmployees}
        //onSelectionChange={setSelectedEmployees}
        />
      )}

      {view === 'kanban' && <EmployeeKanbanView />}

      {view === 'tree' && <EmployeeTreeView />}

      {view === 'hierarchy' && <EmployeeHierarchyView />}
    </div>
  )
}
