// enayah-frontend/src/modules/hr/employees/components/onboarding/onboarding-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PersonalStep } from './steps/personal-step'
import {
  CompensationErrors,
  EmploymentContractErrors,
  PersonalErrors,
} from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { EmploymentContractAssignmentStep } from './steps/employment-contract-assignment-step'
import { useLocale, useTranslations } from 'next-intl'
import { CompensationStep } from './steps/compensation-step'
import { CredentialsStep } from './steps/credentials-step'
import { ReviewStep } from './steps/review-step'
import { useRouter } from '../../../../../../i18n/navigation'
import { useOnboardEmployee } from '@/modules/hr/onboarding/hooks/use-onboarding'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { toPersianDigits } from '@/utils/utilities'
import { clearFieldError } from '@/modules/hr/onboarding/utils/clear-field-error'
import { useFormErrors } from '../../hooks/use-form-errors'
//import { emptyToUndefined } from '@/utils/utilities'

type Step =
  | 'personal'
  | 'employmentContractAssignment'
  // | 'contract'
  // | 'assignment'
  | 'compensation'
  | 'credentials'
  | 'review'

interface Props {
  onCancel: () => void
}

export function OnboardingForm({ onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const t = useTranslations('employees')
  const ct = useTranslations('common')
  const et = useTranslations('errors')
  const router = useRouter()
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const onboardMutation = useOnboardEmployee()

  const steps: { key: Step; label: string }[] = [
    { key: 'personal', label: t('personal') },
    { key: 'employmentContractAssignment', label: t('employmentAssignment') },
    // { key: 'contract', label: 'Contract' },
    // { key: 'assignment', label: 'Assignment' },
    { key: 'compensation', label: t('compensation') },
    { key: 'credentials', label: t('credentials') },
    { key: 'review', label: t('review') },
  ]

  const [onboard, setOnboard] = useState<HireEmployeePayload>({
    employee: {
      employeeNumber: '',
      firstNameEn: '',
      secondNameEn: null,
      thirdNameEn: null,
      familyNameEn: '',
      firstNameAr: '',
      secondNameAr: null,
      thirdNameAr: null,
      familyNameAr: '',
      gender: 'male',
      dateOfBirth: null,
      countryId: null,
      countryNameEn: '',
      countryNameAr: '',
    },

    personal: {
      identifications: [],
      emails: [],
      phoneNumbers: [],
      dependents: [],
      addresses: [],
      emergencyContacts: [],
      visas: [],
    },

    employment: {
      hireDate: '',
      startDate: '',
      endDate: null,
      employmentType: 'full_time',
      staffCategory: 'contractual',
    },

    contract: {
      contractNumber: null,
      startDate: '',
      endDate: '',
      contractType: 'initial',
      status: 'active',
      signedDate: null,
      documentPath: null,
      notes: null,
    },

    movement: {
      positionItemId: null,
      itemNumber: null,
      startDate: '',
      remarks: '',
      // officialDepartmentId: '',
      // officialPositionId: '',
      endDate: '',
      sequenceNumber: 1,
      movementType: 'initial', //'' as HireEmployeePayload['movement']['movementType'],
    },

    appointment: {
      actualDepartmentId: null,
      actualPositionId: null,
      managerId: null,
      startDate: '',
      endDate: null,
      appointmentType: 'primary',
      assignmentReason: 'management_decision',
      remarks: null,
      approvedBy: null,
      approvedAt: null,
    },
    compensation: undefined,
    allowances: [],
    credentials: {
      degrees: [],
      boards: [],
      fellowships: [],
      memberships: [],
      licenses: [],
      lifeSupport: [],
      malpractice: [],
    },
  })

  //const [errors, setErrors] = useState<Record<string, string>>({})
  const currentIndex = steps.findIndex((step) => step.key === currentStep)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  // const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({})
  // const [employmentContractErrors, setEmploymentContractErrors] =
  //   useState<EmploymentContractErrors>({})
  const {
    errors: personalErrors,
    setErrors: setPersonalErrors,
    clearError: clearPersonalError,
  } = useFormErrors<PersonalErrors>()

  const {
    errors: employmentContractErrors,
    setErrors: setEmploymentContractErrors,
    clearError: clearEmploymentContractError,
  } = useFormErrors<EmploymentContractErrors>()

  const {
    errors: compensationErrors,
    setErrors: setCompensationErrors,
    updateErrors: updateCompensationErrors,
    clearError: clearCompensationError,
  } = useFormErrors<CompensationErrors>()

  function validatePersonalStep() {
    const e = onboard.employee
    const identification = onboard.personal?.identifications?.[0]

    const email = onboard.personal?.emails?.[0]
    const phone = onboard.personal?.phoneNumbers?.[0]

    const nextErrors: PersonalErrors = {}

    // --------------------------------------------------
    // Basic Information
    // --------------------------------------------------

    if (!e.employeeNumber?.trim()) {
      nextErrors.employeeNumber = et('employeeNumberRequiredError')
    }

    if (!e.firstNameEn?.trim()) {
      nextErrors.firstNameEn = et('firstNameEnRequiredError')
    }

    if (!e.familyNameEn?.trim()) {
      nextErrors.familyNameEn = et('familyNameEnRequiredError')
    }

    if (!e.firstNameAr?.trim()) {
      nextErrors.firstNameAr = et('firstNameArRequiredError')
    }

    if (!e.familyNameAr?.trim()) {
      nextErrors.familyNameAr = et('familyNameArRequiredError')
    }

    if (!e.dateOfBirth?.trim()) {
      nextErrors.dateOfBirth = et('dobRequiredError')
    }

    // --------------------------------------------------
    // Identification
    // --------------------------------------------------

    //const identification = onboard.personal?.identifications?.[0]

    if (identification) {
      const hasIdentificationData = Boolean(
        identification.identificationNumber?.trim() ||
        identification.issueDate ||
        identification.expiryDate ||
        identification.sponsor?.trim() ||
        identification.issuingAuthority?.trim(),
      )

      if (hasIdentificationData) {
        // All identification types require a number
        if (!identification.identificationNumber?.trim()) {
          nextErrors.identificationNumber = et(
            'identificationNumberRequiredError',
          )
        }

        // All identification types require issue date
        if (!identification.issueDate?.trim()) {
          nextErrors.identificationIssueDate = et(
            'identificationIssueDateRequiredError',
          )
        }

        // All identification types require expiry date
        if (!identification.expiryDate?.trim()) {
          nextErrors.identificationExpiryDate = et(
            'identificationExpiryDateRequiredError',
          )
        }

        // All identification types require issuing authority
        if (!identification.issuingAuthority?.trim()) {
          nextErrors.identificationIssuingAuthority = et(
            'identificationIssuingAuthorityRequiredError',
          )
        }

        // Sponsor is required only for Iqama
        if (
          identification.type === 'iqama' &&
          !identification.sponsor?.trim()
        ) {
          nextErrors.identificationSponsor = et(
            'identificationSponsorRequiredError',
          )
        }

        // Date relationship
        if (
          identification.issueDate &&
          identification.expiryDate &&
          identification.expiryDate <= identification.issueDate
        ) {
          nextErrors.identificationExpiryDate = et(
            'identificationExpiryDateAfterIssueDateError',
          )
        }
      }
    }

    // -------------------------
    // Email
    // -------------------------

    if (
      email?.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email.trim())
    ) {
      nextErrors.primaryEmail = et('invalidEmailAddressError')
    }

    if (phone?.phoneNumber) {
      const phoneDigits = phone.phoneNumber.replace(/\D/g, '')

      if (phoneDigits.length < 6 || phoneDigits.length > 15) {
        nextErrors.primaryMobile = et('invalidMobileNumberError')
      }
    }

    setPersonalErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function validateEmploymentContractAssignmentStep() {
    const employment = onboard.employment
    const contract = onboard.contract
    const movement = onboard.movement
    const appointment = onboard.appointment

    const nextErrors: EmploymentContractErrors = {}

    if (!employment.hireDate?.trim()) {
      nextErrors.hireDate = et('hireDateRequiredError')
    }

    if (!contract.endDate?.trim()) {
      nextErrors.contractEndDate = et('contractEndDateRequiredError')
    }

    if (
      employment.hireDate &&
      contract.endDate &&
      contract.endDate <= employment.hireDate
    ) {
      nextErrors.contractEndDate = et('contractEndDateAfterHireDateError')
    }

    if (!employment.employmentType) {
      nextErrors.employmentType = et('employmentTypeRequiredError')
    }

    if (!employment.staffCategory) {
      nextErrors.staffCategory = et('staffCategoryRequiredError')
    }

    const isMilitary = employment.staffCategory === 'military'

    const requiresPositionItem =
      employment.staffCategory === 'civilian' ||
      employment.staffCategory === 'contractual'

    if (requiresPositionItem && !movement.positionItemId?.trim()) {
      nextErrors.positionItemId = et('positionItemRequiredError')
    }

    //const isMilitary = employment.staffCategory === 'military'

    if (isMilitary) {
      if (!appointment?.actualDepartmentId) {
        nextErrors.actualDepartmentId = et('actualDepartmentRequiredError')
      }

      if (!appointment?.actualPositionId) {
        nextErrors.actualPositionId = et('actualPositionRequiredError')
      }
    }

    setEmploymentContractErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function validateCompensationStep() {
    const compensation = onboard.compensation
    const allowances = onboard.allowances ?? []

    const nextErrors: CompensationErrors = {
      allowanceTypes: {},
      allowanceAmounts: {},
    }

    /*
     * Compensation is optional.
     * Nothing entered = valid.
     */
    if (!compensation && allowances.length === 0) {
      setCompensationErrors({})
      return true
    }

    /*
     * Defensive check.
     *
     * The current UI should not allow allowances
     * without compensation, but keep this here
     * in case state somehow becomes inconsistent.
     */
    if (!compensation) {
      nextErrors.baseSalary = et('compensationRequiredForAllowancesError')

      setCompensationErrors(nextErrors)

      return false
    }

    if (
      !Number.isFinite(compensation.baseSalary) ||
      compensation.baseSalary <= 0
    ) {
      nextErrors.baseSalary = et('baseSalaryRequiredError')
    }

    // if (compensation.effectiveDate !== onboard.contract.startDate) {
    //   nextErrors.effectiveDate = et('compensationEffectiveDateError')
    // }
    if (!onboard.contract.startDate) {
      nextErrors.effectiveDate = et('compensationEffectiveDateError')
    }

    allowances.forEach((allowance, index) => {
      if (!allowance.type?.trim()) {
        nextErrors.allowanceTypes![index] = et('allowanceTypeRequiredError')
      }

      if (!Number.isFinite(allowance.amount) || allowance.amount <= 0) {
        nextErrors.allowanceAmounts![index] = et('allowanceAmountRequiredError')
      }
    })

    const hasAllowanceTypeErrors =
      Object.keys(nextErrors.allowanceTypes ?? {}).length > 0

    const hasAllowanceAmountErrors =
      Object.keys(nextErrors.allowanceAmounts ?? {}).length > 0

    const hasErrors =
      Boolean(nextErrors.effectiveDate) ||
      Boolean(nextErrors.baseSalary) ||
      hasAllowanceTypeErrors ||
      hasAllowanceAmountErrors

    if (!hasAllowanceTypeErrors) {
      delete nextErrors.allowanceTypes
    }

    if (!hasAllowanceAmountErrors) {
      delete nextErrors.allowanceAmounts
    }

    setCompensationErrors(nextErrors)

    return !hasErrors
  }

  function goNext() {
    if (currentStep === 'personal') {
      if (!validatePersonalStep()) {
        return
      }
    }

    if (currentStep === 'employmentContractAssignment') {
      if (!validateEmploymentContractAssignmentStep()) {
        return
      }
    }

    if (currentStep === 'compensation') {
      if (!validateCompensationStep()) {
        return
      }
    }

    const next = steps[currentIndex + 1]

    if (next) {
      setCurrentStep(next.key)
    }
  }

  function goBack() {
    const previous = steps[currentIndex - 1]

    if (previous) {
      setCurrentStep(previous.key)
    }
  }

  async function handleSubmit() {
    // TODO: Call onboarding mutation with hire payload
    const { contractNumber, ...contractWithoutNumber } = onboard.contract

    const payload: HireEmployeePayload = {
      ...onboard,

      contract: contractNumber ? onboard.contract : contractWithoutNumber,

      employee: {
        ...onboard.employee,
        //dateOfBirth: emptyToUndefined(onboard.employee.dateOfBirth),
        countryNameEn: undefined,
        countryNameAr: undefined,
        //endDate: emptyToUndefined(onboard.employment.endDate),
      },

      movement: {
        ...onboard.movement,
        positionItemId: onboard.movement.positionItemId || undefined,
        itemNumber: undefined,
        //officialDepartmentId: onboard.movement.officialDepartmentId || '',
        //officialPositionId: onboard.movement.officialPositionId || '',
        //endDate: emptyToUndefined(onboard.movement.endDate || ''),
        //sequenceNumber: onboard.movement.sequenceNumber,
      },

      appointment: onboard.appointment
        ? {
            ...onboard.appointment,
            actualDepartmentNameEn: undefined,
            actualDepartmentNameAr: undefined,
            actualPositionTitleEn: undefined,
            actualPositionTitleAr: undefined,
          }
        : undefined,

      compensation: onboard.compensation
        ? {
            ...onboard.compensation,
            effectiveDate: onboard.contract.startDate,
          }
        : undefined,

      credentials: {
        degrees:
          onboard.credentials?.degrees?.map(({ id, ...degree }) => degree) ??
          [],

        boards:
          onboard.credentials?.boards?.map(({ id, ...board }) => board) ?? [],

        fellowships:
          onboard.credentials?.fellowships?.map(
            ({ id, ...fellowship }) => fellowship,
          ) ?? [],

        memberships:
          onboard.credentials?.memberships?.map(
            ({ id, ...membership }) => membership,
          ) ?? [],

        licenses:
          onboard.credentials?.licenses?.map(({ id, ...license }) => license) ??
          [],

        lifeSupport:
          onboard.credentials?.lifeSupport?.map(
            ({ id, ...lifeSupport }) => lifeSupport,
          ) ?? [],

        malpractice:
          onboard.credentials?.malpractice?.map(
            ({ id, ...malpractice }) => malpractice,
          ) ?? [],
      },
    }
    onboardMutation.mutate(payload, {
      onSuccess: (result) => {
        toast.success('Employee onboarded successfully')

        router.push(`/employees/${result.employee.id}/profile`)
      },

      onError: (error) => {
        const axiosError = error as AxiosError<{ message?: string }>
        //toast.error('Failed to onboard employee')
        toast.error(
          axiosError.response?.data?.message ?? 'Failed to onboard employee',
        )
      },
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>{t('hireEmployee')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('onboardingProcess')}
          </p>
        </div>

        <Button variant='outline' onClick={onCancel}>
          {ct('cancel')}
        </Button>
      </div>

      <div className='flex flex-wrap items-center gap-1 rounded-lg border bg-background p-4'>
        {steps.map((step, index) => {
          const active = step.key === currentStep
          const completed = index < currentIndex

          return (
            <div key={step.key} className='flex items-center'>
              <button
                type='button'
                disabled={index > currentIndex}
                onClick={() => {
                  if (index <= currentIndex) {
                    setCurrentStep(step.key)
                  }
                }}
                className={[
                  'flex items-center gap-2',
                  index > currentIndex && 'cursor-not-allowed',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    completed && 'border-green-600 bg-green-600 text-white',
                    active &&
                      'border-primary bg-primary text-primary-foreground',
                    !active &&
                      !completed &&
                      'border-muted-foreground text-muted-foreground',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {completed
                    ? '✓'
                    : isRtl
                      ? toPersianDigits(index + 1)
                      : index + 1}
                </span>

                <span
                  className={[
                    'text-sm font-medium',
                    active && 'text-primary',
                    completed && 'text-green-600',
                    !active && !completed && 'text-muted-foreground',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className='mx-4 h-px w-8 bg-border' />
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentIndex].label}</CardTitle>
        </CardHeader>

        <CardContent>
          {currentStep === 'personal' && (
            <PersonalStep
              value={onboard}
              onChange={setOnboard}
              personalErrors={personalErrors}
              onClearError={clearPersonalError}
            />
          )}

          {currentStep === 'employmentContractAssignment' && (
            <EmploymentContractAssignmentStep
              value={onboard}
              onChange={setOnboard}
              employmentContractErrors={employmentContractErrors}
              onClearError={clearEmploymentContractError}
            />
          )}

          {currentStep === 'compensation' && (
            // <CompensationStep value={onboard} onChange={setOnboard} />
            <CompensationStep
              value={onboard}
              onChange={setOnboard}
              errors={compensationErrors}
              onClearError={clearCompensationError}
              onUpdateErrors={updateCompensationErrors}
            />
          )}

          {currentStep === 'credentials' && (
            <CredentialsStep value={onboard} onChange={setOnboard} />
          )}

          {currentStep === 'review' && <ReviewStep value={onboard} />}
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button variant='outline' onClick={goBack} disabled={isFirst}>
          {ct('back')}
        </Button>

        {isLast ? (
          <Button
            type='button'
            onClick={handleSubmit}
            disabled={onboardMutation.isPending}
          >
            {onboardMutation.isPending ? 'Submitting...' : 'Submit Onboarding'}
          </Button>
        ) : (
          <Button type='button' onClick={goNext}>
            {ct('next')}
          </Button>
        )}
      </div>
    </div>
  )
}
