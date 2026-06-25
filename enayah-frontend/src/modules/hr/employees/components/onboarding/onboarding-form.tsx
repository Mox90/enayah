'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PersonalStep } from './steps/personal-step'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
//import { EmploymentStep } from './steps/employment-step'
//import { ContractStep } from './steps/contract-step'
import { EmploymentContractAssignmentStep } from './steps/employment-contract-assignment-step'
import { useLocale, useTranslations } from 'next-intl'
import { CompensationStep } from './steps/compensation-step'
import { CredentialsStep } from './steps/credentials-step'
import { ReviewStep } from './steps/review-step'
import { useRouter } from '../../../../../../i18n/navigation'
import { useOnboardEmployee } from '@/modules/hr/onboarding/hooks/use-onboarding'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
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

// const steps: { key: Step; label: string }[] = [
//   { key: 'personal', label: 'Personal' },
//   { key: 'employmentContractAssignment', label: 'Employment & Assignment' },
//   { key: 'contract', label: 'Contract' },
//   { key: 'assignment', label: 'Assignment' },
//   { key: 'compensation', label: 'Compensation' },
//   { key: 'credentials', label: 'Credentials' },
//   { key: 'review', label: 'Review' },
// ]

export function OnboardingForm({ onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const t = useTranslations('employees')
  const ct = useTranslations('common')
  const et = useTranslations('errors')
  const router = useRouter()
  const locale = useLocale()
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
      positionItemId: '',
      itemNumber: null,
      startDate: '',
      remarks: '',
      officialDepartmentId: '',
      officialPositionId: '',
      endDate: '',
      sequenceNumber: '',
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

  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({})

  function validatePersonalStep() {
    const e = onboard.employee

    const nextErrors: PersonalErrors = {}

    if (!e.employeeNumber?.trim()) {
      nextErrors.employeeNumber = et('employeeNumberRequiredError')
    }

    // if (!e.countryId) {
    //   nextErrors.countryId = 'Nationality is required.'
    // }

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

    // if (!e.gender) {
    //   nextErrors.gender = 'Gender is required.'
    // }

    if (!e.dateOfBirth?.trim()) {
      nextErrors.dateOfBirth = et('dobRequiredError')
    }

    setPersonalErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function goNext() {
    // const next = steps[currentIndex + 1]

    // if (next) {
    //   setCurrentStep(next.key)
    // }

    if (currentStep === 'personal') {
      if (!validatePersonalStep()) {
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
        itemNumber: undefined,
        officialDepartmentId: onboard.movement.officialDepartmentId || '',
        officialPositionId: onboard.movement.officialPositionId || '',
        //endDate: emptyToUndefined(onboard.movement.endDate || ''),
        sequenceNumber: onboard.movement.sequenceNumber || '',
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
    // const result = await submitOnboarding(hire)
    // if (result.success) onCancel()
    // const payload = {
    //   ...onboard,
    //   credentials: {
    //     ...onboard.credentials,
    //     degrees: onboard.credentials?.degrees?.map(
    //       ({ clientId, ...degree }) => degree,
    //     ),
    //     boards: onboard.credentials?.boards?.map(
    //       ({ clientId, ...board }) => board,
    //     ),
    //     fellowships: onboard.credentials?.fellowships?.map(
    //       ({ clientId, ...fellowship }) => fellowship,
    //     ),
    //     memberships: onboard.credentials?.memberships?.map(
    //       ({ clientId, ...membership }) => membership,
    //     ),
    //     licenses: onboard.credentials?.licenses?.map(
    //       ({ clientId, ...license }) => license,
    //     ),
    //     lifeSupport: onboard.credentials?.lifeSupport?.map(
    //       ({ clientId, ...lifeSupport }) => lifeSupport,
    //     ),
    //     malpractice: onboard.credentials?.malpractice?.map(
    //       ({ clientId, ...malpractice }) => malpractice,
    //     ),
    //   },
    // }
    // hireMutation.mutate(payload)
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

      {/* <div className='flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-3'>
        {steps.map((step, index) => {
          const active = step.key === currentStep
          const completed = index < currentIndex

          return (
            <div key={step.key} className='flex items-center'>
              <button
                type='button'
                onClick={() => setCurrentStep(step.key)}
                className={[
                  'text-sm font-medium transition-colors',

                  active && 'text-primary',

                  completed && 'text-green-600',

                  !active && !completed && 'text-muted-foreground',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {step.label}
              </button>

              {index < steps.length - 1 && (
                <span className='mx-3 text-muted-foreground'>{'>'}</span>
              )}
            </div>
          )
        })}
      </div> */}
      <div className='flex flex-wrap items-center gap-1 rounded-lg border bg-background p-4'>
        {steps.map((step, index) => {
          const active = step.key === currentStep
          const completed = index < currentIndex

          return (
            <div key={step.key} className='flex items-center'>
              <button
                type='button'
                onClick={() => setCurrentStep(step.key)}
                className='flex items-center gap-2'
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
                  {completed ? '✓' : index + 1}
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
            />
          )}

          {currentStep === 'employmentContractAssignment' && (
            <EmploymentContractAssignmentStep
              value={onboard}
              onChange={setOnboard}
            />
          )}

          {/* {currentStep === 'employment' && (
            // <div className='text-sm text-muted-foreground'>
            //   Employment form will be here.
            // </div>
            <EmploymentStep value={hire} onChange={setHire} />
          )}

          {currentStep === 'contract' && (
            // <div className='text-sm text-muted-foreground'>
            //   Contract form will be here.
            // </div>
            <ContractStep value={hire} onChange={setHire} />
          )}

          {currentStep === 'assignment' && (
            <div className='text-sm text-muted-foreground'>
              Assignment / PCN form will be here.
            </div>
          )} */}

          {currentStep === 'compensation' && (
            // <div className='text-sm text-muted-foreground'>
            //   Compensation form will be here.
            // </div>
            <CompensationStep value={onboard} onChange={setOnboard} />
          )}

          {currentStep === 'credentials' && (
            // <div className='text-sm text-muted-foreground'>
            //   Credentials form will be here.
            // </div>
            <CredentialsStep value={onboard} onChange={setOnboard} />
          )}

          {currentStep === 'review' && (
            // <div className='text-sm text-muted-foreground'>
            //   Review and submit form will be here.
            // </div>
            <ReviewStep value={onboard} />
          )}
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
