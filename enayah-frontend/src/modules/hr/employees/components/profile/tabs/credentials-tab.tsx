'use client'

import { useEmployeeCredentials } from '@/modules/hr/credentials/hooks/use-employee-credentials'
import { CredentialDegrees } from './cards/credential-degrees'
import { CredentialBoards } from './cards/credential-boards'
import { CredentialLicenses } from './cards/credential-licenses'
import { CredentialFellowships } from './cards/credential-fellowships'
import { CredentialMemberships } from './cards/credential-memberships'
import { CredentialLifeSupport } from './cards/credential-lifesupport'
import { CredentialMalpractice } from './cards/credential-malpractice'

interface Props {
  employeeId: string
}

const CredentialsTab = ({ employeeId }: Props) => {
  const { data, isLoading } = useEmployeeCredentials(employeeId)

  //console.log('employeeId=', employeeId)
  //const query = useEmployeeCredentials(employeeId)
  //console.log(query)
  const c = data?.credentials

  return (
    <div className='space-y-6'>
      <CredentialDegrees degrees={c?.degrees ?? []} />

      <CredentialBoards boards={c?.boards ?? []} />

      <CredentialLicenses licenses={c?.licenses ?? []} />

      <CredentialFellowships fellowships={c?.fellowships ?? []} />

      <CredentialMemberships memberships={c?.memberships ?? []} />

      <CredentialLifeSupport lifeSupports={c?.lifeSupport ?? []} />

      <CredentialMalpractice malpractice={c?.malpractice ?? []} />
    </div>
  )
}

export default CredentialsTab
