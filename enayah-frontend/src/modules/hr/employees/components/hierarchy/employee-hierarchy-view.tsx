'use client'

import { useOrganizationView } from '../../hooks/use-organization-view'
import { DepartmentNode } from './department-node'

export function EmployeeHierarchyView() {
  const { data, isLoading } = useOrganizationView()

  if (isLoading) {
    return <div className='rounded-lg border p-8'>Loading...</div>
  }

  return (
    <div className='rounded-lg border p-4'>
      {data?.map((department) => (
        <DepartmentNode key={department.id} node={department} />
      ))}
    </div>
  )
}
