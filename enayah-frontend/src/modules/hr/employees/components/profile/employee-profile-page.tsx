'use client'

import { AlertCircle, UserRoundX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useEmployeeProfile } from '../../hooks/use-employee-profile'
import { useUploadEmployeeAvatar } from '../../hooks/use-upload-employee-avatar'

import { EmployeeProfileHeader } from './employee-profile-header'
import { EmployeeProfileTabs } from './employee-profile-tabs'

export function EmployeeProfileWorkspace() {
  const params = useParams<{
    id: string
  }>()

  const t = useTranslations('employeeProfile')

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
    return <EmployeeProfileSkeleton />
  }

  if (isError) {
    return (
      <EmployeeProfileError
        title={t('loadError')}
        description={error?.message ?? t('loadErrorDescription')}
      />
    )
  }

  if (!profile) {
    return (
      <EmployeeProfileEmpty
        title={t('notFound')}
        description={t('notFoundDescription')}
      />
    )
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

function EmployeeProfileSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Profile Header */}

      <Card className='overflow-hidden'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
            <Skeleton className='size-24 shrink-0 rounded-full' />

            <div className='flex-1 space-y-3'>
              <Skeleton className='h-6 w-52 max-w-full' />
              <Skeleton className='h-4 w-36 max-w-full' />

              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-6 w-24 rounded-full' />
                <Skeleton className='h-6 w-28 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}

      <div className='space-y-4'>
        <div className='flex gap-2 overflow-hidden'>
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Skeleton key={index} className='h-9 w-24 shrink-0 rounded-md' />
          ))}
        </div>

        {/* Initial tab content */}

        <Card className='overflow-hidden'>
          <div className='border-b bg-muted/20 px-5 py-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-10 rounded-lg' />

              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-3 w-64 max-w-full' />
              </div>
            </div>
          </div>

          <CardContent className='p-5'>
            <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <Skeleton key={index} className='h-20 rounded-lg' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StateProps {
  title: string
  description: string
}

function EmployeeProfileError({ title, description }: StateProps) {
  return (
    // <div className='rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-5'>
    <div
      role='alert'
      className='rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-5'
    >
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10'>
          {/* <AlertCircle className='size-5 text-destructive' /> */}
          <AlertCircle aria-hidden='true' className='size-5 text-destructive' />
        </div>

        <div className='min-w-0'>
          <p className='text-sm font-semibold text-destructive'>{title}</p>

          <p className='mt-1 break-words text-sm text-muted-foreground'>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmployeeProfileEmpty({ title, description }: StateProps) {
  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center px-6 py-12 text-center'>
        <div className='flex size-12 items-center justify-center rounded-full border bg-muted/30'>
          <UserRoundX className='size-5 text-muted-foreground' />
        </div>

        <h2 className='mt-4 text-sm font-semibold'>{title}</h2>

        <p className='mt-1 max-w-md text-sm leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
