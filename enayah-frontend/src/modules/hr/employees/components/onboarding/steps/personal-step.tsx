'use client'

import { Separator } from '@/components/ui/separator'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { EmployeeBasicInformation } from '../sections/employee-basic-information'
import { EmployeeContactInformation } from '../sections/employee-contact-information'
import { EmployeeIdentificationInformation } from '../sections/employee-identification-information'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
//import { EmployeeBasicInformation } from '../sections/employee-basic-information'
//import { EmployeeContactInformation } from '../sections/employee-contact-information'
//import { EmployeeIdentificationInformation } from '../sections/employee-identification-information'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
}

export function PersonalStep({ value, onChange, personalErrors }: Props) {
  return (
    <div className='space-y-6'>
      <EmployeeBasicInformation
        value={value}
        onChange={onChange}
        personalErrors={personalErrors}
      />

      <Separator />

      <EmployeeContactInformation value={value} onChange={onChange} />

      <Separator />

      <EmployeeIdentificationInformation value={value} onChange={onChange} />
    </div>
  )
}
