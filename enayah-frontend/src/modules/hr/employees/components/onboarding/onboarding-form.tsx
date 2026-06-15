'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PersonalStep } from './steps/personal-step'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { EmploymentStep } from './steps/employment-step'
import { ContractStep } from './steps/contract-step'
import { EmploymentContractAssignmentStep } from './steps/employment-contract-assignment-step'

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

const steps: { key: Step; label: string }[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'employmentContractAssignment', label: 'Employment & Assignment' },
  // { key: 'contract', label: 'Contract' },
  // { key: 'assignment', label: 'Assignment' },
  { key: 'compensation', label: 'Compensation' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'review', label: 'Review' },
]

export function OnboardingForm({ onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('personal')

  const [hire, setHire] = useState<HireEmployeePayload>({
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
      startDate: '',
      remarks: '',
      officialDepartmentId: '',
      officialPositionId: '',
      endDate: '',
      sequenceNumber: '',
      movementType: '' as HireEmployeePayload['movement']['movementType'],
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
    const e = hire.employee

    const nextErrors: PersonalErrors = {}

    if (!e.employeeNumber?.trim()) {
      nextErrors.employeeNumber = 'Employee Number is required.'
    }

    // if (!e.countryId) {
    //   nextErrors.countryId = 'Nationality is required.'
    // }

    if (!e.firstNameEn?.trim()) {
      nextErrors.firstNameEn = 'First Name (EN) is required.'
    }

    if (!e.familyNameEn?.trim()) {
      nextErrors.familyNameEn = 'Family Name (EN) is required.'
    }

    if (!e.firstNameAr?.trim()) {
      nextErrors.firstNameAr = 'First Name (AR) is required.'
    }

    if (!e.familyNameAr?.trim()) {
      nextErrors.familyNameAr = 'Family Name (AR) is required.'
    }

    // if (!e.gender) {
    //   nextErrors.gender = 'Gender is required.'
    // }

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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Hire Employee</h1>
          <p className='text-sm text-muted-foreground'>
            Complete the employee onboarding process step by step.
          </p>
        </div>

        <Button variant='outline' onClick={onCancel}>
          Cancel
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
              value={hire}
              onChange={setHire}
              personalErrors={personalErrors}
            />
          )}

          {currentStep === 'employmentContractAssignment' && (
            <EmploymentContractAssignmentStep value={hire} onChange={setHire} />
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
            <div className='text-sm text-muted-foreground'>
              Compensation form will be here.
            </div>
          )}

          {currentStep === 'credentials' && (
            <div className='text-sm text-muted-foreground'>
              Credentials form will be here.
            </div>
          )}

          {currentStep === 'review' && (
            <div className='text-sm text-muted-foreground'>
              Review and submit form will be here.
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button variant='outline' onClick={goBack} disabled={isFirst}>
          Back
        </Button>

        {isLast ? (
          <Button type='button'>Submit Onboarding</Button>
        ) : (
          <Button type='button' onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
