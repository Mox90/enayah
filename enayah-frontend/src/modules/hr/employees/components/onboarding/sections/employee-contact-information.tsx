'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmployeeContactInformation({ value, onChange }: Props) {
  const email = value.personal?.emails?.[0]
  const phone = value.personal?.phoneNumbers?.[0]

  function updateEmail(emailValue: string) {
    onChange({
      ...value,
      personal: {
        ...value.personal,
        emails: emailValue
          ? [
              {
                type: 'work',
                email: emailValue,
                isPrimary: true,
                isVerified: false,
              },
            ]
          : [],
      },
    })
  }

  function updatePhone(phoneValue: string) {
    onChange({
      ...value,
      personal: {
        ...value.personal,
        phoneNumbers: phoneValue
          ? [
              {
                type: 'mobile',
                countryCode: '+966',
                phoneNumber: phoneValue,
                isPrimary: true,
                isWhatsapp: false,
              },
            ]
          : [],
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Contact Information</h3>
        <p className='text-sm text-muted-foreground'>
          Primary email and phone number.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Primary Email</Label>
          <Input
            type='email'
            value={email?.email ?? ''}
            onChange={(e) => updateEmail(e.target.value)}
            placeholder='employee@hospital.sa'
          />
        </div>

        <div className='space-y-2'>
          <Label>Primary Mobile</Label>
          <Input
            value={phone?.phoneNumber ?? ''}
            onChange={(e) => updatePhone(e.target.value)}
            placeholder='512345678'
          />
        </div>
      </div>
    </section>
  )
}
