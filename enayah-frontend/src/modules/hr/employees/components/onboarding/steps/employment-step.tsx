'use client'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { EmploymentInformation } from '../sections/employment-information'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmploymentStep({ value, onChange }: Props) {
  return (
    <div className='space-y-6'>
      <EmploymentInformation value={value} onChange={onChange} />
    </div>
  )
}
