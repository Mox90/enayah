'use client'

import { useParams } from 'next/navigation'

import { useEmployeeProfile } from '../../hooks/use-employee-profile'

import { EmployeeProfileHeader } from './employee-profile-header'

import { EmployeeProfileTabs } from './employee-profile-tabs'

export function EmployeeProfileWorkspace() {
  const params = useParams()

  const id = params.id as string

  const { data, isLoading } = useEmployeeProfile(id)

  if (isLoading) {
    return <>Loading...</>
  }

  if (!data) {
    return <div>Employee not found.</div>
  }

  return (
    <div className='space-y-6'>
      <EmployeeProfileHeader profile={data} />

      <EmployeeProfileTabs profile={data} />
    </div>
  )
}
