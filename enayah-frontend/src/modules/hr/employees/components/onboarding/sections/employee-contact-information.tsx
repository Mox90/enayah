// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employee-contact-information.tsx

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneCodeCombobox } from '@/modules/countries/components/phone-code'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { useTranslations } from 'next-intl'
import { OnboardingFormSection } from './onboarding-form-section'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
  onClearError: (field: keyof PersonalErrors) => void
}

export function EmployeeContactInformation({
  value,
  onChange,
  personalErrors,
  onClearError,
}: Props) {
  const et = useTranslations('employees')

  const email = value.personal?.emails?.[0]
  const phone = value.personal?.phoneNumbers?.[0]

  function updateEmail(emailValue: string) {
    onClearError('primaryEmail')

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

  function normalizePhone(value: string) {
    return value.replace(/\D/g, '').replace(/^0+/, '')
  }

  function updatePhoneCode(countryCode: string) {
    onClearError('primaryMobile')

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
          : [],
      },
    })
  }

  function updatePhone(phoneValue: string) {
    onClearError('primaryMobile')

    const normalized = normalizePhone(phoneValue)

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
    <OnboardingFormSection
      title={et('contactInfo')}
      description={et('contactInfoSub')}
      badge={et('optional')}
    >
      <div className='grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2'>
        {/* Email */}

        <div className='space-y-2'>
          <Label
            htmlFor='primary-email'
            className={
              personalErrors.primaryEmail ? 'text-destructive' : undefined
            }
          >
            {et('primaryEmail')}
          </Label>

          <Input
            id='primary-email'
            type='email'
            autoComplete='email'
            className='h-11'
            value={email?.email ?? ''}
            aria-invalid={Boolean(personalErrors.primaryEmail)}
            onChange={(event) => updateEmail(event.target.value)}
            placeholder='employee@hospital.sa'
          />

          {personalErrors.primaryEmail && (
            <p className='text-xs font-medium text-destructive'>
              {personalErrors.primaryEmail}
            </p>
          )}
        </div>

        {/* Mobile */}

        <div className='space-y-2'>
          <Label
            htmlFor='primary-mobile'
            className={
              personalErrors.primaryMobile ? 'text-destructive' : undefined
            }
          >
            {et('primaryMobile')}
          </Label>

          <div
            className={[
              'flex h-11 overflow-hidden rounded-md border bg-background transition-shadow',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
              personalErrors.primaryMobile
                ? 'border-destructive'
                : 'border-input',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PhoneCodeCombobox
              value={phone?.countryCode ?? '+966'}
              onChange={updatePhoneCode}
              className='rounded-none border-0 border-e'
            />

            <Input
              id='primary-mobile'
              type='tel'
              inputMode='numeric'
              autoComplete='tel'
              className='h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
              value={phone?.phoneNumber ?? ''}
              aria-invalid={Boolean(personalErrors.primaryMobile)}
              onChange={(event) => updatePhone(event.target.value)}
              placeholder='512345678'
            />
          </div>

          {personalErrors.primaryMobile && (
            <p className='text-xs font-medium text-destructive'>
              {personalErrors.primaryMobile}
            </p>
          )}
        </div>
      </div>
    </OnboardingFormSection>
  )
}
