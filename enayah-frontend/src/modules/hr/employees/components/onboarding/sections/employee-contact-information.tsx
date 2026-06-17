'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneCodeCombobox } from '@/modules/countries/components/phone-code'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { useTranslations } from 'next-intl'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmployeeContactInformation({ value, onChange }: Props) {
  const et = useTranslations('employees')
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

  function normalizePhone(phone: string) {
    return phone.replace(/^0+/, '')
  }

  function updatePhoneCode(countryCode: string) {
    const currentPhone = phone?.phoneNumber ?? ''

    onChange({
      ...value,
      personal: {
        ...value.personal,
        phoneNumbers: currentPhone
          ? [
              {
                type: phone?.type ?? 'mobile',
                countryCode,
                phoneNumber: currentPhone,
                isPrimary: phone?.isPrimary ?? true,
                isWhatsapp: phone?.isWhatsapp ?? false,
              },
            ]
          : [
              {
                type: 'mobile',
                countryCode,
                phoneNumber: '',
                isPrimary: true,
                isWhatsapp: false,
              },
            ],
      },
    })
  }

  function updatePhone(phoneValue: string) {
    const normalized = normalizePhone(phoneValue) //phoneValue.replace(/^0+/, '')

    onChange({
      ...value,
      personal: {
        ...value.personal,
        phoneNumbers: normalized
          ? [
              {
                type: phone?.type ?? 'mobile',
                countryCode: phone?.countryCode ?? '+966',
                phoneNumber: normalized,
                isPrimary: true,
                isWhatsapp: phone?.isWhatsapp ?? false,
              },
            ]
          : [],
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>{et('contactInfo')}</h3>
        <p className='text-sm text-muted-foreground'>{et('contactInfoSub')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>{et('primaryEmail')}</Label>
          <Input
            type='email'
            value={email?.email ?? ''}
            onChange={(e) => updateEmail(e.target.value)}
            placeholder='employee@hospital.sa'
          />
        </div>

        <div className='space-y-2'>
          <Label>{et('primaryMobile')}</Label>

          <div className='flex h-10 overflow-hidden rounded-md border border-input bg-background'>
            <PhoneCodeCombobox
              value={phone?.countryCode ?? '+966'}
              onChange={updatePhoneCode}
              className='border-0 border-r rounded-none'
            />

            <Input
              className='!border-0 !shadow-none !bg-transparent !rounded-none focus-visible:ring-0 focus-visible:ring-offset-0'
              value={phone?.phoneNumber ?? ''}
              onChange={(e) => updatePhone(e.target.value)}
              placeholder='512345678'
            />
          </div>
        </div>
      </div>
    </section>
  )
}
