// enayah-frontend/src/modules/hr/employees/components/onboarding/steps/personal-step.tsx

'use client'

import { Separator } from '@/components/ui/separator'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { EmployeeBasicInformation } from '../sections/employee-basic-information'
import { EmployeeContactInformation } from '../sections/employee-contact-information'
import { EmployeeIdentificationInformation } from '../sections/employee-identification-information'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
  onClearError: (field: keyof PersonalErrors) => void
}

export function PersonalStep({
  value,
  onChange,
  personalErrors,
  onClearError,
}: Props) {
  return (
    <div className='space-y-6'>
      <EmployeeBasicInformation
        value={value}
        onChange={onChange}
        personalErrors={personalErrors}
        onClearError={onClearError}
      />

      <Separator />

      <EmployeeContactInformation
        value={value}
        onChange={onChange}
        personalErrors={personalErrors}
        onClearError={onClearError}
      />

      <Separator />

      <EmployeeIdentificationInformation
        value={value}
        onChange={onChange}
        personalErrors={personalErrors}
        onClearError={onClearError}
      />
    </div>
  )
}
