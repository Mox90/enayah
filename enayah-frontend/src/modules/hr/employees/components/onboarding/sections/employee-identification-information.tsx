// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employee-identification-information.tsx

'use client'

import { DatePicker } from '@/components/dialogs/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  // const hasIdentificationData = Boolean(
  //   identification?.identificationNumber?.trim() ||
  //   identification?.issueDate ||
  //   identification?.expiryDate ||
  //   identification?.sponsor?.trim() ||
  //   identification?.issuingAuthority?.trim(),
  // )
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

    if (
      (field === 'issueDate' || field === 'expiryDate') &&
      nextIdentification.issueDate &&
      nextIdentification.expiryDate &&
      nextIdentification.expiryDate > nextIdentification.issueDate
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
          <Label htmlFor='identification-type'>{t('idType')}</Label>

          <div className='h-11'>
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
                className='w-full data-[size=default]:h-11'
              >
                <SelectValue placeholder={t('idType')} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='national_id'>{t('national_id')}</SelectItem>
                <SelectItem value='iqama'>{t('iqama')}</SelectItem>
                <SelectItem value='gcc_id'>{t('gcc_id')}</SelectItem>
                <SelectItem value='passport'>{t('passport')}</SelectItem>
                <SelectItem value='other'>{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Identification Number */}
        <div className='space-y-2'>
          <Label
            htmlFor='identification-number'
            className={
              personalErrors.identificationNumber
                ? 'text-destructive'
                : undefined
            }
          >
            {t('idNumber')}

            {hasIdentificationData && (
              <span className='ms-1 text-destructive'>*</span>
            )}
          </Label>

          <Input
            id='identification-number'
            className='h-11'
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
          <Label
            htmlFor='identification-issue-date'
            className={
              personalErrors.identificationIssueDate
                ? 'text-destructive'
                : undefined
            }
          >
            {ct('issueDate')}

            {requiresCommonFields && (
              <span className='ms-1 text-destructive'>*</span>
            )}
          </Label>

          <DatePicker
            id='identification-issue-date'
            value={identification?.issueDate ?? null}
            onChange={(date) => updateIdentification('issueDate', date)}
          />

          {personalErrors.identificationIssueDate && (
            <p className='text-sm text-destructive'>
              {personalErrors.identificationIssueDate}
            </p>
          )}
        </div>

        {/* Expiry Date */}
        <div className='space-y-2'>
          <Label
            htmlFor='identification-expiry-date'
            className={
              personalErrors.identificationExpiryDate
                ? 'text-destructive'
                : undefined
            }
          >
            {ct('expiryDate')}

            {requiresCommonFields && (
              <span className='ms-1 text-destructive'>*</span>
            )}
          </Label>

          <DatePicker
            id='identification-expiry-date'
            value={identification?.expiryDate ?? null}
            onChange={(date) => updateIdentification('expiryDate', date)}
          />

          {personalErrors.identificationExpiryDate && (
            <p className='text-sm text-destructive'>
              {personalErrors.identificationExpiryDate}
            </p>
          )}
        </div>

        {/* Sponsor - Iqama only */}
        {identificationType === 'iqama' && (
          <div className='space-y-2'>
            <Label
              htmlFor='identification-sponsor'
              className={
                personalErrors.identificationSponsor
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('sponsor')}

              {requiresSponsor && (
                <span className='ms-1 text-destructive'>*</span>
              )}
            </Label>

            <Input
              id='identification-sponsor'
              className='h-11'
              value={identification?.sponsor ?? ''}
              aria-invalid={Boolean(personalErrors.identificationSponsor)}
              onChange={(event) =>
                updateIdentification('sponsor', event.target.value || null)
              }
            />

            {personalErrors.identificationSponsor && (
              <p className='text-sm text-destructive'>
                {personalErrors.identificationSponsor}
              </p>
            )}
          </div>
        )}

        {/* Issuing Authority */}
        <div className='space-y-2'>
          <Label
            htmlFor='identification-issuing-authority'
            className={
              personalErrors.identificationIssuingAuthority
                ? 'text-destructive'
                : undefined
            }
          >
            {t('issuingAuthority')}

            {requiresCommonFields && (
              <span className='ms-1 text-destructive'>*</span>
            )}
          </Label>

          <Input
            id='identification-issuing-authority'
            className='h-11'
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

          {personalErrors.identificationIssuingAuthority && (
            <p className='text-sm text-destructive'>
              {personalErrors.identificationIssuingAuthority}
            </p>
          )}
        </div>
      </div>
    </OnboardingFormSection>
  )
}
