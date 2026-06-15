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
  const { data, isLoading, error, isError } = useEmployeeCredentials(employeeId)

  //console.log(data.credentials, isLoading, error, isError)

  if (isLoading) {
    return <div className='p-8 text-center'>Loading credentials...</div>
  }

  if (error) {
    return (
      <div className='p-8 text-center text-red-600'>
        Failed to load credentials
      </div>
    )
  }
  //const c = data?.credentials

  return (
    <div className='space-y-6'>
      <CredentialDegrees degrees={data?.degrees ?? []} />

      <CredentialBoards boards={data?.boards ?? []} />

      <CredentialLicenses licenses={data?.licenses ?? []} />

      <CredentialFellowships fellowships={data?.fellowships ?? []} />

      <CredentialMemberships memberships={data?.memberships ?? []} />

      <CredentialLifeSupport lifeSupports={data?.lifeSupport ?? []} />

      <CredentialMalpractice malpractice={data?.malpractice ?? []} />
    </div>
  )
}

export default CredentialsTab
