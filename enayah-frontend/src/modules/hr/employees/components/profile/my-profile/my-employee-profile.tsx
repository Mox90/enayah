// src/modules/hr/employees/components/my-employee-profile.tsx

'use client'

import { AlertCircle, Loader2 } from 'lucide-react'

//import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useMyEmployeeProfile } from '../../../hooks/use-my-employee-profile'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EmployeeProfileHeader } from '../employee-profile-header'
import { useParams } from 'next/navigation'
import { useUploadEmployeeAvatar } from '../../../hooks/use-upload-employee-avatar'
import { EmployeeProfileTabs } from '../employee-profile-tabs'

export function MyEmployeeProfile() {
  const params = useParams<{
    id: string
  }>()

  const employeeId = params.id
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyEmployeeProfile()

  const uploadAvatarMutation = useUploadEmployeeAvatar(employeeId)

  const onAvatarUpload = async (file: File): Promise<void> => {
    await uploadAvatarMutation.mutateAsync(file)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[300px] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />

        <AlertTitle>Unable to load profile</AlertTitle>

        <AlertDescription className='space-y-3'>
          <p>
            {error instanceof Error
              ? error.message
              : 'Your employee profile could not be loaded.'}
          </p>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className='h-4 w-4' />

        <AlertTitle>Profile not found</AlertTitle>

        <AlertDescription>
          Your user account is not linked to an employee profile.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {/* <h1 className='text-2xl font-semibold tracking-tight'>My Profile</h1> */}

      {/* Render existing profile component here */}
      {/* <pre className='overflow-auto rounded-lg border bg-muted/30 p-4'>
        {JSON.stringify(profile, null, 2)}
      </pre> */}
      <EmployeeProfileHeader
        profile={profile}
        onAvatarUpload={onAvatarUpload}
      />

      <EmployeeProfileTabs employeeId={employeeId} profile={profile} />
    </div>
  )
}
