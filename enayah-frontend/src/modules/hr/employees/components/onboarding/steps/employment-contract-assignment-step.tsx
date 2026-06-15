// src/modules/hr/employees/components/onboarding/steps/employment-contract-assignment-step.tsx

'use client'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { EmploymentContractAssignmentInformation } from '../sections/employment-contract-assignment-information'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmploymentContractAssignmentStep({ value, onChange }: Props) {
  return (
    <div className='space-y-6'>
      <EmploymentContractAssignmentInformation
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
