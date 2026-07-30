'use client'

import { useParams } from 'next/navigation'

import { useEmployeeProfile } from '../../hooks/use-employee-profile'
import { useUploadEmployeeAvatar } from '../../hooks/use-upload-employee-avatar'

import { EmployeeProfileTabs } from './employee-profile-tabs'
import { EmployeeProfileHeader } from './employee-profile-header'

export function EmployeeProfileWorkspace() {
  const params = useParams<{
    id: string
  }>()

  const employeeId = params.id

  const {
    data: profile,
    isLoading,
    error,
    isError,
  } = useEmployeeProfile(employeeId)

  /*
   * Hooks must be called before any conditional return.
   */
  const uploadAvatarMutation = useUploadEmployeeAvatar(employeeId)

  const onAvatarUpload = async (file: File): Promise<void> => {
    await uploadAvatarMutation.mutateAsync(file)
  }

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

  if (!profile) {
    return <div>Employee not found.</div>
  }

  return (
    <div className='space-y-6'>
      <EmployeeProfileHeader
        profile={profile}
        onAvatarUpload={onAvatarUpload}
      />

      <EmployeeProfileTabs employeeId={employeeId} profile={profile} />
    </div>
  )
}
