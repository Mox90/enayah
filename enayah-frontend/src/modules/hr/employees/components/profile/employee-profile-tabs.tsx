'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

//import { EmployeeProfile } from '../../types/employee-directory.types'
import PersonalTab from './tabs/personal-tab'
import EmploymentTab from './tabs/employment-tab'
import CredentialsTab from './tabs/credentials-tab'
import TrainingTab from './tabs/training-tab'
import CPDTab from './tabs/cpd-tab'
import { useState } from 'react'
import { EmployeeProfile } from '../../types/employee-profile.types'
import { useLocale, useTranslations } from 'next-intl'
import {
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  GraduationCap,
  UserRound,
} from 'lucide-react'
import { Badge as UiBadge } from '@/components/ui/badge'
import { useCredentialSummary } from '../../hooks/use-employee-profile'

interface Props {
  employeeId: string
  profile: EmployeeProfile
}

export function EmployeeProfileTabs({ employeeId, profile }: Props) {
  const [tab, setTab] = useState('personal')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const et = useTranslations('employees')

  const {
    data: profileSummary,
    isLoading: isProfileSummaryLoading,
    isError: isProfileSummaryError,
  } = useCredentialSummary(employeeId)

  //console.log(profile.personal)
  //console.log(profileSummary)
  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      dir={isRtl ? 'rtl' : 'ltr'}
      className='space-y-2.5'
    >
      <TabsList
        variant={'line'}
        className='w-full justify-start gap-1 overflow-x-auto'
      >
        <TabsTrigger
          value='personal'
          className='group min-w-fit gap-2 px-3 py-2.5'
        >
          <UserRound className='size-4 text-muted-foreground group-data-[state=active]:text-primary' />
          {et('personal')}
        </TabsTrigger>

        <TabsTrigger
          value='employment'
          className='group min-w-fit gap-2 px-3 py-2.5'
        >
          <BriefcaseBusiness className='size-4 text-muted-foreground group-data-[state=active]:text-primary' />
          {et('employment')}
        </TabsTrigger>

        <TabsTrigger
          value='credentials'
          className='group min-w-fit gap-2 px-3 py-2.5'
        >
          <BadgeCheck className='size-4 text-muted-foreground group-data-[state=active]:text-primary' />
          <span>{et('credentials')}</span>
          {!isProfileSummaryLoading && !isProfileSummaryError && (
            <UiBadge
              variant='secondary'
              className='h-5 min-w-5 rounded-full px-1.5 text-[10px] tabular-nums'
            >
              {profileSummary?.credentialsCount ?? 0}
            </UiBadge>
          )}
        </TabsTrigger>

        <TabsTrigger
          value='training'
          className='group min-w-fit gap-2 px-3 py-2.5'
        >
          <GraduationCap className='size-4 text-muted-foreground group-data-[state=active]:text-primary' />
          <span>{et('training')}</span>

          {!isProfileSummaryLoading && !isProfileSummaryError && (
            <UiBadge
              variant='secondary'
              className='h-5 min-w-5 rounded-full px-1.5 text-[10px]'
            >
              {profileSummary?.trainingCount ?? 0}
            </UiBadge>
          )}
        </TabsTrigger>

        <TabsTrigger value='cpd' className='group min-w-fit gap-2 px-3 py-2.5'>
          <BookOpenCheck className='size-4 text-muted-foreground group-data-[state=active]:text-primary' />
          <span>{et('cpd')}</span>

          {!isProfileSummaryLoading && !isProfileSummaryError && (
            <UiBadge
              variant='secondary'
              className='h-5 min-w-5 rounded-full px-1.5 text-[10px]'
            >
              {profileSummary?.cpdCount ?? 0}
            </UiBadge>
          )}
        </TabsTrigger>

        {/* <TabsTrigger
          value='another'
          className='group min-w-fit gap-2 px-3 py-2.5'
        >
          Another
        </TabsTrigger> */}
      </TabsList>

      <div className={isRtl ? 'text-right' : 'text-left'}>
        <TabsContent value='personal'>
          <PersonalTab personal={profile.personal} />
        </TabsContent>

        <TabsContent value='employment'>
          <EmploymentTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value='credentials'>
          <CredentialsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value='training'>
          <TrainingTab training={employeeId} />
        </TabsContent>

        <TabsContent value='cpd'>
          <CPDTab cpd={employeeId} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
