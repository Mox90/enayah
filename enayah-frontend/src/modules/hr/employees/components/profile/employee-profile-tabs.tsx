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

interface Props {
  employeeId: string
  profile: EmployeeProfile
}

export function EmployeeProfileTabs({ employeeId, profile }: Props) {
  const [tab, setTab] = useState('personal')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const et = useTranslations('employees')
  //console.log(profile.personal)
  //console.log(profile.employment)
  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      dir={isRtl ? 'rtl' : 'ltr'}
      // className='space-y-6'
    >
      <TabsList>
        <TabsTrigger value='personal'>{et('personal')}</TabsTrigger>

        <TabsTrigger value='employment'>{et('employment')}</TabsTrigger>

        <TabsTrigger value='credentials'>{et('credentials')}</TabsTrigger>

        <TabsTrigger value='training'>{et('training')}</TabsTrigger>

        <TabsTrigger value='cpd'>{et('cpd')}</TabsTrigger>
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
