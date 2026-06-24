'use client'

import { useParams } from 'next/navigation'

import { useEmployeeProfile } from '../../hooks/use-employee-profile'
import { EmployeeProfileTabs } from './employee-profile-tabs'
import { EmployeeProfileHeader } from './employee-profile-header'

export function EmployeeProfileWorkspace() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading, error, isError } = useEmployeeProfile(id)
  //console.log('Version received from backend is ' + data?.personal.version)

  if (isLoading) {
    return <>Loading...</>
  }

  if (isError) {
    return (
      <div>
        Error loading employee profile: {error?.message ?? 'Unknown error'}
      </div>
    )
  }

  if (!data) {
    return <div>Employee not found.</div>
  }

  return (
    <div className='space-y-6'>
      <EmployeeProfileHeader profile={data} />

      <EmployeeProfileTabs employeeId={id} profile={data} />
    </div>
  )
}
