// enayah-frontend/src/modules/hr/employees/components/onboarding/steps/employment-contract-assignment-step.tsx

'use client'

import { EmploymentContractErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { EmploymentContractAssignmentInformation } from '../sections/employment-contract-assignment-information'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void

  employmentContractErrors: EmploymentContractErrors

  onClearError: (field: keyof EmploymentContractErrors) => void
}

export function EmploymentContractAssignmentStep({
  value,
  onChange,
  employmentContractErrors,
  onClearError,
}: Props) {
  return (
    <div className='space-y-6'>
      <EmploymentContractAssignmentInformation
        value={value}
        onChange={onChange}
        employmentContractErrors={employmentContractErrors}
        onClearError={onClearError}
      />
    </div>
  )
}
