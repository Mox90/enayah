// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employment-contract-assignment-information.tsx

'use client'

import type { ReactNode } from 'react'

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
import { Textarea } from '@/components/ui/textarea'
import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import { EmploymentContractErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'
import { PositionCombobox } from '@/modules/hr/positions/components/position-combobox'
import { useLocale, useTranslations } from 'next-intl'

type EmploymentInput = HireEmployeePayload['employment']
type MovementInput = HireEmployeePayload['movement']
type AppointmentInput = NonNullable<HireEmployeePayload['appointment']>

type EmploymentType = EmploymentInput['employmentType']
type StaffCategory = EmploymentInput['staffCategory']
type AppointmentType = AppointmentInput['appointmentType']

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  employmentContractErrors: EmploymentContractErrors
  onClearError: (field: keyof EmploymentContractErrors) => void
}

interface FormSectionProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: 'neutral' | 'required'
  children: ReactNode
}

function FormSection({
  title,
  description,
  badge,
  badgeVariant = 'neutral',
  children,
}: FormSectionProps) {
  return (
    <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
      <div className='border-b bg-muted/20 px-5 py-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h4 className='text-sm font-semibold tracking-tight'>{title}</h4>

            {description && (
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            )}
          </div>

          {badge && (
            <span
              className={[
                'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium',
                badgeVariant === 'required'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-border bg-background text-muted-foreground',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className='p-5'>{children}</div>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className='text-xs font-medium text-destructive'>{message}</p>
}

export function EmploymentContractAssignmentInformation({
  value,
  onChange,
  employmentContractErrors,
  onClearError,
}: Props) {
  const t = useTranslations('contracts')

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const employment = value.employment
  const contract = value.contract
  const movement = value.movement

  const isMilitary = employment.staffCategory === 'military'

  const requiresPositionItem =
    employment.staffCategory === 'civilian' ||
    employment.staffCategory === 'contractual'

  const appointment = value.appointment ?? {
    actualDepartmentNameEn: null,
    actualDepartmentNameAr: null,
    actualPositionTitleEn: null,
    actualPositionTitleAr: null,
    actualDepartmentId: null,
    actualPositionId: null,
    managerId: null,
    startDate: value.contract.startDate ?? null,
    endDate: null,
    appointmentType: 'primary',
    assignmentReason: 'management_decision',
    remarks: null,
    approvedBy: null,
    approvedAt: null,
  }

  function updateEffectiveDate(date: string | null) {
    onClearError('hireDate')
    onClearError('contractEndDate')

    onChange({
      ...value,

      employment: {
        ...employment,
        hireDate: date,
        startDate: date,
      },

      contract: {
        ...contract,
        startDate: date,
      },

      movement: {
        ...movement,
        startDate: date,
      },

      appointment: {
        ...appointment,
        startDate: date,
      },

      compensation: value.compensation
        ? {
            ...value.compensation,
            effectiveDate: date,
          }
        : value.compensation,
    })
  }

  function updateContractEndDate(date: string | null) {
    onClearError('contractEndDate')

    onChange({
      ...value,

      employment: {
        ...employment,
        endDate: null,
      },

      contract: {
        ...contract,
        endDate: date,
      },

      movement: {
        ...movement,
        endDate: date,
      },
    })
  }

  function updateEmployment<K extends keyof EmploymentInput>(
    field: K,
    fieldValue: EmploymentInput[K],
  ) {
    onChange({
      ...value,

      employment: {
        ...employment,
        [field]: fieldValue,
      },
    })
  }

  function updateMovement<K extends keyof MovementInput>(
    field: K,
    fieldValue: MovementInput[K],
  ) {
    onChange({
      ...value,

      movement: {
        ...movement,
        [field]: fieldValue,
      },
    })
  }

  function updateAppointment<K extends keyof AppointmentInput>(
    field: K,
    fieldValue: AppointmentInput[K],
  ) {
    onChange({
      ...value,

      appointment: {
        ...appointment,
        [field]: fieldValue,
      },
    })
  }

  return (
    <section className='space-y-6'>
      {/* ------------------------------------------------ */}
      {/* Employment Terms */}
      {/* ------------------------------------------------ */}

      <FormSection
        title={t('employmentTerms')}
        description={t('employmentTermsSub')}
      >
        <div className='grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2'>
          {/* Effective / Hire Date */}

          <div className='space-y-2'>
            <Label
              htmlFor='hire-date'
              className={
                employmentContractErrors.hireDate
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('hireEffectiveDate')}

              <span aria-hidden='true' className='ms-1 text-destructive'>
                *
              </span>
            </Label>

            <DatePicker
              id='hire-date'
              value={employment.hireDate ?? null}
              onChange={updateEffectiveDate}
            />

            <p className='text-xs leading-relaxed text-muted-foreground'>
              {t('hireEffectiveDateHint')}
            </p>

            <FieldError message={employmentContractErrors.hireDate} />
          </div>

          {/* Contract End Date */}

          <div className='space-y-2'>
            <Label
              htmlFor='contract-end-date'
              className={
                employmentContractErrors.contractEndDate
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('endDate')}

              <span aria-hidden='true' className='ms-1 text-destructive'>
                *
              </span>
            </Label>

            <DatePicker
              id='contract-end-date'
              value={contract.endDate ?? null}
              onChange={updateContractEndDate}
            />

            <FieldError message={employmentContractErrors.contractEndDate} />
          </div>

          {/* Employment Type */}

          <div className='space-y-2'>
            <Label
              htmlFor='employment-type'
              className={
                employmentContractErrors.employmentType
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('employmentType')}

              <span aria-hidden='true' className='ms-1 text-destructive'>
                *
              </span>
            </Label>

            <Select
              dir={isRtl ? 'rtl' : 'ltr'}
              value={employment.employmentType}
              onValueChange={(selectedValue) => {
                onClearError('employmentType')

                updateEmployment(
                  'employmentType',
                  selectedValue as EmploymentType,
                )
              }}
            >
              <SelectTrigger
                id='employment-type'
                className='w-full data-[size=default]:h-11'
                aria-invalid={Boolean(employmentContractErrors.employmentType)}
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='full_time'>{t('fullTime')}</SelectItem>
                <SelectItem value='part_time'>{t('partTime')}</SelectItem>
                <SelectItem value='locum'>{t('locum')}</SelectItem>
              </SelectContent>
            </Select>

            <FieldError message={employmentContractErrors.employmentType} />
          </div>

          {/* Staff Category */}

          <div className='space-y-2'>
            <Label
              htmlFor='staff-category'
              className={
                employmentContractErrors.staffCategory
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('staffCategory')}

              <span aria-hidden='true' className='ms-1 text-destructive'>
                *
              </span>
            </Label>

            <Select
              dir={isRtl ? 'rtl' : 'ltr'}
              value={employment.staffCategory}
              onValueChange={(selectedValue) => {
                onClearError('staffCategory')
                if (selectedValue === 'military') {
                  onClearError('positionItemId')
                } else {
                  onClearError('actualDepartmentId')
                  onClearError('actualPositionId')
                }

                updateEmployment(
                  'staffCategory',
                  selectedValue as StaffCategory,
                )
              }}
            >
              <SelectTrigger
                id='staff-category'
                className='w-full data-[size=default]:h-11'
                aria-invalid={Boolean(employmentContractErrors.staffCategory)}
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='civilian'>{t('civilian')}</SelectItem>
                <SelectItem value='military'>{t('military')}</SelectItem>
                <SelectItem value='contractual'>{t('contractual')}</SelectItem>
              </SelectContent>
            </Select>

            <FieldError message={employmentContractErrors.staffCategory} />
          </div>

          {/* Contract Type */}

          <div className='space-y-2'>
            <Label>{t('contractType')}</Label>

            <div className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'>
              <span className='text-sm font-medium'>{t('initial')}</span>

              <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                {t('systemDefined')}
              </span>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ------------------------------------------------ */}
      {/* Legal Assignment */}
      {/* ------------------------------------------------ */}

      <FormSection
        title={t('legalAssignment')}
        description={t('legalAssignmentSub')}
      >
        <div className='space-y-5'>
          {/* PCN */}

          <div className='space-y-2'>
            <Label
              className={
                employmentContractErrors.positionItemId
                  ? 'text-destructive'
                  : undefined
              }
            >
              {t('pcnLabel')}

              {requiresPositionItem && (
                <span aria-hidden='true' className='ms-1 text-destructive'>
                  *
                </span>
              )}
            </Label>

            {employment.staffCategory === 'military' && (
              <p className='text-xs text-muted-foreground'>
                {t('pcnOptionalForMilitary')}
              </p>
            )}

            <PositionItemCombobox
              value={movement.positionItemId}
              selectedLabel={movement.itemNumber}
              onChange={(item) => {
                onClearError('positionItemId')

                if (!item) {
                  onChange({
                    ...value,
                    movement: {
                      ...movement,
                      positionItemId: null,
                      itemNumber: null,
                    },
                  })

                  return
                }

                onChange({
                  ...value,
                  movement: {
                    ...movement,
                    positionItemId: item.id,
                    itemNumber: item.itemNumber,
                    startDate: movement.startDate || value.contract.startDate,
                  },
                  appointment: {
                    ...appointment,
                    actualDepartmentId: item.departmentId,
                    actualPositionId: item.positionId,
                    actualDepartmentNameEn: item.departmentNameEn ?? null,
                    actualDepartmentNameAr: item.departmentNameAr ?? null,
                    actualPositionTitleEn: item.positionTitleEn ?? null,
                    actualPositionTitleAr: item.positionTitleAr ?? null,
                    startDate:
                      value.appointment?.startDate ??
                      movement.startDate ??
                      value.contract.startDate ??
                      null,
                    appointmentType:
                      value.appointment?.appointmentType ?? 'primary',
                    assignmentReason:
                      value.appointment?.assignmentReason ??
                      'management_decision',
                  },
                })
              }}
            />

            <FieldError message={employmentContractErrors.positionItemId} />

            {movement.itemNumber && (
              <div className='rounded-lg border bg-muted/20 px-3 py-2.5'>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                  <span className='text-xs text-muted-foreground'>
                    {t('selectedPcn')}
                  </span>

                  <span className='text-sm font-semibold'>
                    {movement.itemNumber}
                  </span>

                  <span className='text-xs text-muted-foreground'>
                    {t('appointmentDefaultsFromPcn')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Movement Remarks */}

          <div className='space-y-2'>
            <Label htmlFor='movement-remarks'>{t('movementRemarks')}</Label>

            <Textarea
              id='movement-remarks'
              value={movement.remarks ?? ''}
              onChange={(event) =>
                updateMovement('remarks', event.target.value)
              }
              rows={2}
              placeholder={t('movementRemarksPlaceholder')}
            />
          </div>
        </div>
      </FormSection>

      {/* ------------------------------------------------ */}
      {/* Actual Working Assignment */}
      {/* ------------------------------------------------ */}

      <FormSection
        title={t('actualWorkingAssignment')}
        description={
          isMilitary
            ? t('actualMilitaryAppointmentSub')
            : t('actualAppointmentSub')
        }
        badge={isMilitary ? t('required') : t('optional')}
        badgeVariant={isMilitary ? 'required' : 'neutral'}
      >
        <div className='space-y-5'>
          <div className='rounded-lg border bg-muted/20 px-4 py-3'>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              {t('actualAssignmentHint')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2'>
            {/* Actual Department */}

            <div className='space-y-2'>
              <Label
                className={
                  employmentContractErrors.actualDepartmentId
                    ? 'text-destructive'
                    : undefined
                }
              >
                {t('actualDepartmentLabel')}
                {isMilitary && <span className='ms-1 text-destructive'>*</span>}
              </Label>

              <DepartmentCombobox
                value={appointment.actualDepartmentId ?? null}
                selectedLabel={
                  isRtl
                    ? (appointment.actualDepartmentNameAr ??
                      appointment.actualDepartmentNameEn ??
                      undefined)
                    : (appointment.actualDepartmentNameEn ?? undefined)
                }
                onChange={(department) => {
                  onClearError('actualDepartmentId')
                  onChange({
                    ...value,
                    appointment: {
                      ...appointment,
                      actualDepartmentId: department.id,
                      actualDepartmentNameEn: department.nameEn ?? null,
                      actualDepartmentNameAr: department.nameAr ?? null,
                    },
                  })
                }}
              />

              <FieldError
                message={employmentContractErrors.actualDepartmentId}
              />
            </div>

            {/* Actual Position */}

            <div className='space-y-2'>
              <Label
                className={
                  employmentContractErrors.actualPositionId
                    ? 'text-destructive'
                    : undefined
                }
              >
                {t('actualPositionLabel')}

                {isMilitary && <span className='ms-1 text-destructive'>*</span>}
              </Label>

              <PositionCombobox
                value={appointment.actualPositionId ?? null}
                selectedLabel={
                  isRtl
                    ? (appointment.actualPositionTitleAr ??
                      appointment.actualPositionTitleEn ??
                      undefined)
                    : (appointment.actualPositionTitleEn ?? undefined)
                }
                onChange={(position) => {
                  onClearError('actualPositionId')
                  onChange({
                    ...value,
                    appointment: {
                      ...appointment,
                      actualPositionId: position.id,
                      actualPositionTitleEn: position.titleEn ?? null,
                      actualPositionTitleAr: position.titleAr ?? null,
                    },
                  })
                }}
              />

              <FieldError message={employmentContractErrors.actualPositionId} />
            </div>

            {/* Manager */}

            <div className='space-y-2'>
              <Label htmlFor='manager-id'>{t('managerId')}</Label>

              <Input
                id='manager-id'
                className='h-11'
                value={appointment.managerId ?? ''}
                onChange={(event) =>
                  updateAppointment('managerId', event.target.value || null)
                }
                placeholder={t('optional')}
              />
            </div>

            {/* Appointment Type */}

            <div className='space-y-2'>
              <Label htmlFor='appointment-type'>
                {t('appointmentTypeLabel')}
              </Label>

              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={appointment.appointmentType ?? 'primary'}
                onValueChange={(selectedValue) =>
                  updateAppointment(
                    'appointmentType',
                    selectedValue as AppointmentType,
                  )
                }
              >
                <SelectTrigger
                  id='appointment-type'
                  className='w-full data-[size=default]:h-11'
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='primary'>{t('primary')}</SelectItem>
                  <SelectItem value='acting'>{t('acting')}</SelectItem>
                  <SelectItem value='temporary'>{t('temporary')}</SelectItem>
                  <SelectItem value='rotation'>{t('rotation')}</SelectItem>
                  <SelectItem value='secondment'>{t('secondment')}</SelectItem>
                  <SelectItem value='concurrent'>{t('concurrent')}</SelectItem>
                  <SelectItem value='permanent_transfer'>
                    {t('permanent')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Remarks */}

          <div className='space-y-2'>
            <Label htmlFor='appointment-remarks'>
              {t('appointmentRemarks')}
            </Label>

            <Textarea
              id='appointment-remarks'
              value={appointment.remarks ?? ''}
              onChange={(event) =>
                updateAppointment('remarks', event.target.value)
              }
              rows={3}
              placeholder={t('appointmentRemarksPlaceholder')}
            />
          </div>
        </div>
      </FormSection>
    </section>
  )
}
