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

interface Props {
  employeeId: string
  profile: EmployeeProfile
}

export function EmployeeProfileTabs({ employeeId, profile }: Props) {
  const [tab, setTab] = useState('personal')
  //console.log(profile.personal)
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value='personal'>Personal</TabsTrigger>

        <TabsTrigger value='employment'>Employment</TabsTrigger>

        <TabsTrigger value='credentials'>Credentials</TabsTrigger>

        <TabsTrigger value='training'>Training</TabsTrigger>

        <TabsTrigger value='cpd'>CPD</TabsTrigger>
      </TabsList>

      <TabsContent value='personal'>
        <PersonalTab personal={profile.personal} />
      </TabsContent>

      <TabsContent value='employment'>
        <EmploymentTab employment={profile.employment} />
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
    </Tabs>
  )
}
