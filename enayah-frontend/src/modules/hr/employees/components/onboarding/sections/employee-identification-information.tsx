// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employee-identification-information.tsx

'use client'

import { DatePicker } from '@/components/dialogs/date-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import {
  HireEmployeePayload,
  IdentificationInput,
} from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { OnboardingFormSection } from './onboarding-form-section'
import { hasIdentificationData as hasIdentificationDataValue } from '@/modules/hr/onboarding/utils/has-identification-data'
import { getTodayDateString } from '@/utils/utilities'
import { FloatingField } from '@/components/forms/floating-field'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
  onClearError: (field: keyof PersonalErrors) => void
}

export function EmployeeIdentificationInformation({
  value,
  onChange,
  personalErrors,
  onClearError,
}: Props) {
  const t = useTranslations('employees')
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const identification = value.personal?.identifications?.[0]
  const identificationType = identification?.type ?? 'iqama'
  const hasIdentificationData = hasIdentificationDataValue(identification)
  const requiresCommonFields = hasIdentificationData
  const requiresSponsor =
    hasIdentificationData && identificationType === 'iqama'

  function clearIdentificationError(field: keyof IdentificationInput) {
    switch (field) {
      case 'identificationNumber':
        onClearError('identificationNumber')
        break

      case 'issueDate':
        onClearError('identificationIssueDate')
        break

      case 'expiryDate':
        onClearError('identificationExpiryDate')
        break

      case 'sponsor':
        onClearError('identificationSponsor')
        break

      case 'issuingAuthority':
        onClearError('identificationIssuingAuthority')
        break
    }
  }

  function updateIdentification<K extends keyof IdentificationInput>(
    field: K,
    fieldValue: IdentificationInput[K],
  ) {
    clearIdentificationError(field)

    /*
     * If the identification number is removed, none of the
     * conditional identification fields remain required.
     */
    // if (field === 'identificationNumber' && !String(fieldValue ?? '').trim()) {
    //   onClearError('identificationIssueDate')
    //   onClearError('identificationExpiryDate')
    //   onClearError('identificationSponsor')
    //   onClearError('identificationIssuingAuthority')
    // }

    /*
     * Changing away from Iqama means Sponsor is no longer
     * required.
     */
    if (field === 'type' && fieldValue !== 'iqama') {
      onClearError('identificationSponsor')
    }

    const nextIdentification = {
      type: identification?.type ?? 'iqama',
      identificationNumber: identification?.identificationNumber ?? '',
      issueDate: identification?.issueDate ?? null,
      expiryDate: identification?.expiryDate ?? null,
      sponsor: identification?.sponsor ?? null,
      issuingAuthority: identification?.issuingAuthority ?? null,
      isCurrent: true,
      ...identification,
      [field]: fieldValue,
    }

    // if (
    //   (field === 'issueDate' || field === 'expiryDate') &&
    //   nextIdentification.issueDate &&
    //   nextIdentification.expiryDate &&
    //   nextIdentification.expiryDate > nextIdentification.issueDate
    // ) {
    //   onClearError('identificationExpiryDate')
    // }
    if (
      (field === 'issueDate' || field === 'expiryDate') &&
      nextIdentification.issueDate &&
      nextIdentification.expiryDate &&
      nextIdentification.expiryDate > nextIdentification.issueDate &&
      nextIdentification.expiryDate > getTodayDateString()
    ) {
      onClearError('identificationExpiryDate')
    }

    onChange({
      ...value,
      personal: {
        ...value.personal,
        identifications: [nextIdentification],
      },
    })
  }

  return (
    <OnboardingFormSection
      title={t('identification')}
      description={t('identificationInfo')}
      badge={t('optional')}
    >
      <div className='grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2'>
        {/* Identification Type */}
        <div className='space-y-2'>
          <FloatingField
            id='identification-type'
            label={t('idType')}
            filled={Boolean(identificationType)}
          >
            <Select
              dir={isRtl ? 'rtl' : 'ltr'}
              value={identificationType}
              onValueChange={(value) =>
                updateIdentification(
                  'type',
                  value as IdentificationInput['type'],
                )
              }
            >
              <SelectTrigger
                id='identification-type'
                data-floating-control='true'
                className='w-full bg-transparent dark:bg-transparent data-[size=default]:h-12'
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='national_id'>{t('national_id')}</SelectItem>
                <SelectItem value='iqama'>{t('iqama')}</SelectItem>
                <SelectItem value='gcc_id'>{t('gcc_id')}</SelectItem>
                <SelectItem value='passport'>{t('passport')}</SelectItem>
                <SelectItem value='other'>{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </FloatingField>
        </div>

        {/* Identification Number */}
        <div className='space-y-2'>
          <FloatingField
            id='identification-number'
            label={t('idNumber')}
            filled={Boolean(identification?.identificationNumber)}
            invalid={Boolean(personalErrors.identificationNumber)}
            required={hasIdentificationData}
          >
            <Input
              id='identification-number'
              required={hasIdentificationData}
              value={identification?.identificationNumber ?? ''}
              aria-invalid={Boolean(personalErrors.identificationNumber)}
              aria-describedby={
                personalErrors.identificationNumber
                  ? 'identification-number-error'
                  : undefined
              }
              onChange={(event) =>
                updateIdentification('identificationNumber', event.target.value)
              }
            />
          </FloatingField>

          {personalErrors.identificationNumber && (
            <p
              id='identification-number-error'
              className='text-xs font-medium text-destructive'
            >
              {personalErrors.identificationNumber}
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div className='space-y-2'>
          <FloatingField
            id='identification-issue-date'
            label={ct('issueDate')}
            filled={Boolean(identification?.issueDate)}
            invalid={Boolean(personalErrors.identificationIssueDate)}
            required={requiresCommonFields}
          >
            <DatePicker
              id='identification-issue-date'
              value={identification?.issueDate ?? null}
              hidePlaceholder
              ariaInvalid={Boolean(personalErrors.identificationIssueDate)}
              ariaDescribedBy={
                personalErrors.identificationIssueDate
                  ? 'identification-issue-date-error'
                  : undefined
              }
              required={requiresCommonFields}
              onChange={(date) => updateIdentification('issueDate', date)}
            />
          </FloatingField>

          {personalErrors.identificationIssueDate && (
            <p
              id='identification-issue-date-error'
              className='text-xs font-medium text-destructive'
            >
              {personalErrors.identificationIssueDate}
            </p>
          )}
        </div>

        {/* Expiry Date */}
        <div className='space-y-2'>
          <FloatingField
            id='identification-expiry-date'
            label={ct('expiryDate')}
            filled={Boolean(identification?.expiryDate)}
            invalid={Boolean(personalErrors.identificationExpiryDate)}
            required={requiresCommonFields}
          >
            <DatePicker
              id='identification-expiry-date'
              value={identification?.expiryDate ?? null}
              hidePlaceholder
              required={requiresCommonFields}
              onChange={(date) => updateIdentification('expiryDate', date)}
            />
          </FloatingField>

          {personalErrors.identificationExpiryDate && (
            <p className='text-xs font-medium text-destructive'>
              {personalErrors.identificationExpiryDate}
            </p>
          )}
        </div>

        {/* Sponsor - Iqama only */}
        {identificationType === 'iqama' && (
          <div className='space-y-2'>
            <FloatingField
              id='identification-sponsor'
              label={t('sponsor')}
              filled={Boolean(identification?.sponsor)}
              invalid={Boolean(personalErrors.identificationSponsor)}
              required={requiresSponsor}
            >
              <Input
                id='identification-sponsor'
                required={requiresSponsor}
                value={identification?.sponsor ?? ''}
                aria-invalid={Boolean(personalErrors.identificationSponsor)}
                onChange={(event) =>
                  updateIdentification('sponsor', event.target.value || null)
                }
              />
            </FloatingField>

            {personalErrors.identificationSponsor && (
              <p className='text-xs font-medium text-destructive'>
                {personalErrors.identificationSponsor}
              </p>
            )}
          </div>
        )}

        {/* Issuing Authority */}
        <div className='space-y-2'>
          <FloatingField
            id='identification-issuing-authority'
            label={t('issuingAuthority')}
            filled={Boolean(identification?.issuingAuthority)}
            invalid={Boolean(personalErrors.identificationIssuingAuthority)}
            required={requiresCommonFields}
          >
            <Input
              id='identification-issuing-authority'
              required={requiresCommonFields}
              value={identification?.issuingAuthority ?? ''}
              aria-invalid={Boolean(
                personalErrors.identificationIssuingAuthority,
              )}
              onChange={(event) =>
                updateIdentification(
                  'issuingAuthority',
                  event.target.value || null,
                )
              }
            />
          </FloatingField>

          {personalErrors.identificationIssuingAuthority && (
            <p className='text-xs font-medium text-destructive'>
              {personalErrors.identificationIssuingAuthority}
            </p>
          )}
        </div>
      </div>
    </OnboardingFormSection>
  )
}
