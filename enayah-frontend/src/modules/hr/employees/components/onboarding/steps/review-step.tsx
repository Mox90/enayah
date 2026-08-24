// enayah-frontend/src/modules/hr/employees/components/onboarding/steps/review-step.tsx

'use client'

import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { formatDate, humanize } from '@/utils/utilities'
import { useLocale, useTranslations } from 'next-intl'

import { OnboardingFormSection } from '../sections/onboarding-form-section'
import { SaudiRiyalSymbol } from '@/components/icons/saudi-riyal-symbol'

interface Props {
  value: HireEmployeePayload
}

interface FieldProps {
  label: string
  value?: ReactNode
}

function Field({ label, value }: FieldProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className='min-w-0 space-y-1'>
      <div className='text-xs text-muted-foreground'>{label}</div>

      <div className='break-words text-sm font-medium'>
        {hasValue ? value : '—'}
      </div>
    </div>
  )
}

export function ReviewStep({ value }: Props) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('onboarding')
  const at = useTranslations('allowanceTypes')

  const employee = value.employee
  const personal = value.personal
  const employment = value.employment
  const contract = value.contract
  const movement = value.movement
  const appointment = value.appointment
  const compensation = value.compensation
  const allowances = value.allowances ?? []
  const credentials = value.credentials

  const identifications = personal?.identifications ?? []

  const emails = personal?.emails ?? []

  const phoneNumbers = personal?.phoneNumbers ?? []

  const fullNameEn = [
    employee.firstNameEn,
    employee.secondNameEn,
    employee.thirdNameEn,
    employee.familyNameEn,
  ]
    .filter(Boolean)
    .join(' ')

  const fullNameAr = [
    employee.firstNameAr,
    employee.secondNameAr,
    employee.thirdNameAr,
    employee.familyNameAr,
  ]
    .filter(Boolean)
    .join(' ')

  const countryName = isRtl
    ? (employee.countryNameAr ?? employee.countryNameEn)
    : (employee.countryNameEn ?? employee.countryNameAr)

  const actualDepartmentName = isRtl
    ? (appointment?.actualDepartmentNameAr ??
      appointment?.actualDepartmentNameEn)
    : (appointment?.actualDepartmentNameEn ??
      appointment?.actualDepartmentNameAr)

  const actualPositionTitle = isRtl
    ? (appointment?.actualPositionTitleAr ?? appointment?.actualPositionTitleEn)
    : (appointment?.actualPositionTitleEn ?? appointment?.actualPositionTitleAr)

  const totalAllowances = allowances.reduce(
    (total, allowance) => total + Number(allowance.amount || 0),
    0,
  )

  const baseSalary = compensation?.baseSalary ?? 0

  const totalMonthlyCompensation = baseSalary + totalAllowances

  const formatMoney = (amount: number) => (
    <span
      className='inline-flex items-baseline gap-1.5 tabular-nums'
      dir='ltr'
      aria-label={`${amount} Saudi Riyal`}
    >
      <SaudiRiyalSymbol showAccessibleText={false} className='text-[0.95em]' />
      <span>
        {amount.toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </span>
  )

  const primaryEmail = emails.find((email) => email.isPrimary) ?? emails[0]

  const primaryPhone =
    phoneNumbers.find((phone) => phone.isPrimary) ?? phoneNumbers[0]

  return (
    <div className='space-y-5'>
      {/* ---------------------------------- */}
      {/* Employee */}
      {/* ---------------------------------- */}

      <OnboardingFormSection
        title={t('reviewPersonalInformation')}
        description={t('reviewPersonalInformationSub')}
      >
        <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
          <Field label={t('employeeNumber')} value={employee.employeeNumber} />

          <Field label={t('englishName')} value={fullNameEn} />

          <Field
            label={t('arabicName')}
            value={<span dir='rtl'>{fullNameAr}</span>}
          />

          <Field label={t('gender')} value={humanize(employee.gender)} />

          <Field
            label={t('dateOfBirth')}
            value={formatDate(employee.dateOfBirth, isRtl)}
          />

          <Field label={t('nationality')} value={countryName} />
        </div>
      </OnboardingFormSection>

      {/* ---------------------------------- */}
      {/* Personal / Contact */}
      {/* ---------------------------------- */}

      <OnboardingFormSection
        title={t('reviewContactInformation')}
        description={t('reviewContactInformationSub')}
        badge={t('optional')}
      >
        <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
          <Field label={t('primaryEmail')} value={primaryEmail?.email} />

          <Field
            label={t('primaryMobile')}
            value={
              primaryPhone
                ? `${primaryPhone.countryCode ?? ''} ${primaryPhone.phoneNumber}`
                : undefined
            }
          />

          <Field label={t('identifications')} value={identifications.length} />
        </div>

        {identifications.length > 0 && (
          <div className='mt-5 space-y-3 border-t pt-5'>
            {identifications.map((identification, index) => (
              <div
                key={`${identification.type}-${identification.identificationNumber}-${index}`}
                className='grid grid-cols-1 gap-4 rounded-lg border bg-muted/10 p-4 md:grid-cols-2 lg:grid-cols-4'
              >
                <Field
                  label={t('identificationType')}
                  value={humanize(identification.type)}
                />

                <Field
                  label={t('identificationNumber')}
                  value={identification.identificationNumber}
                />

                <Field
                  label={t('issueDate')}
                  value={formatDate(identification.issueDate, isRtl)}
                />

                <Field
                  label={t('expiryDate')}
                  value={formatDate(identification.expiryDate, isRtl)}
                />
              </div>
            ))}
          </div>
        )}
      </OnboardingFormSection>

      {/* ---------------------------------- */}
      {/* Employment */}
      {/* ---------------------------------- */}

      <OnboardingFormSection
        title={t('reviewEmploymentAssignment')}
        description={t('reviewEmploymentAssignmentSub')}
      >
        <div className='space-y-6'>
          <div>
            <div className='mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('employmentTerms')}
            </div>

            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
              <Field
                label={t('hireDate')}
                value={formatDate(employment.hireDate, isRtl)}
              />

              <Field
                label={t('startDate')}
                value={formatDate(employment.startDate, isRtl)}
              />

              <Field
                label={t('employmentType')}
                value={humanize(employment.employmentType)}
              />

              <Field
                label={t('staffCategory')}
                value={humanize(employment.staffCategory)}
              />
            </div>
          </div>

          <div className='border-t pt-5'>
            <div className='mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('contract')}
            </div>

            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
              <Field
                label={t('contractStart')}
                value={formatDate(contract.startDate, isRtl)}
              />

              <Field
                label={t('contractEnd')}
                value={formatDate(contract.endDate, isRtl)}
              />

              <Field
                label={t('contractType')}
                value={humanize(contract.contractType ?? 'initial')}
              />

              <Field
                label={t('contractStatus')}
                value={humanize(contract.status ?? 'active')}
              />
            </div>
          </div>

          <div className='border-t pt-5'>
            <div className='mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('legalAssignment')}
            </div>

            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
              <Field
                label={t('positionItemPcn')}
                value={
                  movement.itemNumber ??
                  (movement.positionItemId
                    ? movement.positionItemId
                    : t('noPcnAssigned'))
                }
              />

              <Field
                label={t('movementType')}
                value={humanize(movement.movementType ?? 'initial')}
              />
            </div>

            {employment.staffCategory === 'military' &&
              !movement.positionItemId && (
                <p className='mt-3 text-xs text-muted-foreground'>
                  {t('militaryNoPcnReviewHint')}
                </p>
              )}
          </div>

          <div className='border-t pt-5'>
            <div className='mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('actualWorkingAssignment')}
            </div>

            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
              <Field
                label={t('actualDepartment')}
                value={actualDepartmentName ?? appointment?.actualDepartmentId}
              />

              <Field
                label={t('actualPosition')}
                value={actualPositionTitle ?? appointment?.actualPositionId}
              />

              <Field
                label={t('appointmentType')}
                value={
                  appointment?.appointmentType
                    ? humanize(appointment.appointmentType)
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </OnboardingFormSection>

      {/* ---------------------------------- */}
      {/* Compensation */}
      {/* ---------------------------------- */}

      <OnboardingFormSection
        title={t('reviewCompensation')}
        description={t('reviewCompensationSub')}
        badge={compensation ? undefined : t('optional')}
      >
        {compensation ? (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3'>
              {/* <Field
                label={t('effectiveDate')}
                value={formatDate(compensation.effectiveDate, isRtl)}
              /> */}
              <Field
                label={t('effectiveDate')}
                value={formatDate(contract.startDate, isRtl)}
              />

              <Field
                label={t('baseSalary')}
                value={formatMoney(compensation.baseSalary)}
              />

              <Field
                label={t('status')}
                value={humanize(compensation.status ?? 'approved')}
              />

              <Field label={t('reason')} value={compensation.reason} />
            </div>

            <div className='border-t pt-5'>
              <div className='mb-3 flex items-center justify-between gap-4'>
                <div>
                  <h4 className='text-sm font-semibold'>{t('allowances')}</h4>

                  <p className='mt-1 text-xs text-muted-foreground'>
                    {t('reviewAllowancesSub')}
                  </p>
                </div>

                {allowances.length > 0 && (
                  <Badge variant='secondary'>{allowances.length}</Badge>
                )}
              </div>

              {allowances.length === 0 ? (
                <div className='rounded-lg border border-dashed bg-muted/10 px-4 py-5 text-center text-sm text-muted-foreground'>
                  {t('noAllowancesAdded')}
                </div>
              ) : (
                <div className='space-y-2'>
                  {allowances.map((allowance, index) => (
                    <div
                      key={`${allowance.type}-${index}`}
                      className='flex items-center justify-between gap-4 rounded-lg border bg-muted/10 px-4 py-3'
                    >
                      <span className='text-sm'>
                        {typeof allowance.type === 'string' &&
                        at.has(allowance.type)
                          ? at(allowance.type)
                          : humanize(allowance.type)}
                      </span>

                      <span
                        className='shrink-0 text-sm font-semibold tabular-nums'
                        dir='ltr'
                      >
                        {formatMoney(allowance.amount)}
                      </span>
                    </div>
                  ))}

                  <div className='mt-4 flex justify-end border-t pt-4'>
                    <div className='w-full max-w-sm space-y-2'>
                      <div className='flex justify-between gap-4 text-sm'>
                        <span className='text-muted-foreground'>
                          {t('baseSalary')}
                        </span>

                        <span className='font-medium tabular-nums' dir='ltr'>
                          {formatMoney(baseSalary)}
                        </span>
                      </div>

                      <div className='flex justify-between gap-4 text-sm'>
                        <span className='text-muted-foreground'>
                          {t('totalAllowances')}
                        </span>

                        <span className='font-medium tabular-nums' dir='ltr'>
                          {formatMoney(totalAllowances)}
                        </span>
                      </div>

                      <div className='flex justify-between gap-4 border-t pt-2'>
                        <span className='text-sm font-semibold'>
                          {t('totalMonthlyCompensation')}
                        </span>

                        <span className='font-semibold tabular-nums' dir='ltr'>
                          {formatMoney(totalMonthlyCompensation)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='rounded-lg border border-dashed bg-muted/10 px-4 py-6 text-center'>
            <p className='text-sm font-medium'>{t('noCompensationDetails')}</p>

            <p className='mt-1 text-xs text-muted-foreground'>
              {t('noCompensationReviewSub')}
            </p>
          </div>
        )}
      </OnboardingFormSection>

      {/* ---------------------------------- */}
      {/* Credentials */}
      {/* ---------------------------------- */}

      <OnboardingFormSection
        title={t('reviewCredentials')}
        description={t('reviewCredentialsSub')}
        badge={t('optional')}
      >
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
          <CredentialCount
            label={t('degrees')}
            count={credentials?.degrees?.length ?? 0}
          />

          <CredentialCount
            label={t('boards')}
            count={credentials?.boards?.length ?? 0}
          />

          <CredentialCount
            label={t('fellowships')}
            count={credentials?.fellowships?.length ?? 0}
          />

          <CredentialCount
            label={t('memberships')}
            count={credentials?.memberships?.length ?? 0}
          />

          <CredentialCount
            label={t('licenses')}
            count={credentials?.licenses?.length ?? 0}
          />

          <CredentialCount
            label={t('lifeSupport')}
            count={credentials?.lifeSupport?.length ?? 0}
          />

          <CredentialCount
            label={t('malpractice')}
            count={credentials?.malpractice?.length ?? 0}
          />
        </div>
      </OnboardingFormSection>
    </div>
  )
}

function CredentialCount({ label, count }: { label: string; count: number }) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-3'>
      <span className='min-w-0 truncate text-sm text-muted-foreground'>
        {label}
      </span>

      <Badge variant='secondary' className='shrink-0 tabular-nums'>
        {count}
      </Badge>
    </div>
  )
}
