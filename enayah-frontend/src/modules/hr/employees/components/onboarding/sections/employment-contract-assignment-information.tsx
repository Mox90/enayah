// src/modules/hr/employees/components/onboarding/sections/employment-contract-assignment-information.tsx

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
import { Textarea } from '@/components/ui/textarea'
import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'
import { PositionCombobox } from '@/modules/hr/positions/components/position-combobox'
import { useLocale, useTranslations } from 'next-intl'

type EmploymentInput = HireEmployeePayload['employment']
type ContractInput = HireEmployeePayload['contract']
type MovementInput = HireEmployeePayload['movement']
type AppointmentInput = NonNullable<HireEmployeePayload['appointment']>
type EmploymentType = HireEmployeePayload['employment']['employmentType']
type StaffCategory = HireEmployeePayload['employment']['staffCategory']
type ContractType = HireEmployeePayload['contract']['contractType']
type AppointmentType = AppointmentInput['appointmentType']

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmploymentContractAssignmentInformation({
  value,
  onChange,
}: Props) {
  const t = useTranslations('contracts')
  const employment = value.employment
  const contract = value.contract
  const movement = value.movement
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
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function updateEffectiveDate(date: string | null) {
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
    })
  }

  function updateContractEndDate(date: string | null) {
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

  function updateContract<K extends keyof ContractInput>(
    field: K,
    fieldValue: ContractInput[K],
  ) {
    onChange({
      ...value,
      contract: {
        ...contract,
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
    <section className='space-y-8'>
      <div>
        <h3 className='text-lg font-semibold'>{t('eca')}</h3>

        <p className='text-sm text-muted-foreground'>{t('ecaSub')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          {/* <Label>{t('hireDate')}</Label>

          <Input
            type='date'
            value={employment.hireDate ?? ''}
            onChange={(e) => updateEffectiveDate(e.target.value)}
          /> */}
          <label
            htmlFor={'hireDate'}
            className='text-xs text-muted-foreground block'
          >
            {t('hireDate')}
          </label>

          <DatePicker
            id='hireDate'
            value={employment.hireDate ?? null}
            //onChange={(value) => updateEffectiveDate(value ?? '')}
            onChange={updateEffectiveDate}
          />
        </div>

        <div className='space-y-2'>
          {/* <Label>{t('endDate')}</Label>

          <Input
            type='date'
            value={contract.endDate ?? ''}
            onChange={(e) => updateContractEndDate(e.target.value)}
          /> */}
          <label
            htmlFor={'endDate'}
            className='text-xs text-muted-foreground block'
          >
            {t('endDate')}
          </label>

          <DatePicker
            id='endDate'
            value={contract.endDate ?? null}
            //onChange={(value) => updateContractEndDate(value ?? '')}
            onChange={updateContractEndDate}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('employmentType')}</Label>

          <Select
            dir={isRtl ? 'rtl' : 'ltr'}
            value={employment.employmentType}
            onValueChange={(v) =>
              updateEmployment('employmentType', v as EmploymentType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='full_time'>{t('fullTime')}</SelectItem>
              <SelectItem value='part_time'>{t('partTime')}</SelectItem>
              {/* <SelectItem value='contract'>Contract</SelectItem> */}
              {/* <SelectItem value='temporary'>Temporary</SelectItem> */}
              <SelectItem value='locum'>{t('locum')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{t('staffCategory')}</Label>

          <Select
            dir={isRtl ? 'rtl' : 'ltr'}
            value={employment.staffCategory}
            onValueChange={(v) =>
              updateEmployment('staffCategory', v as StaffCategory)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='civilian'>{t('civilian')}</SelectItem>
              <SelectItem value='military'>{t('military')}</SelectItem>
              <SelectItem value='contractual'>{t('contractual')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{t('contractType')}</Label>

          <Select
            dir={isRtl ? 'rtl' : 'ltr'}
            value={contract.contractType ?? 'initial'}
            onValueChange={(v) =>
              updateContract('contractType', v as ContractType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='initial'>{t('initial')}</SelectItem>
              <SelectItem value='renewal'>{t('renewal')}</SelectItem>
              <SelectItem value='amendment'>{t('amendment')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* <div className='space-y-2'>
          <Label>Contract Number</Label>

          <Input
            value={contract.contractNumber ?? ''}
            disabled
            placeholder='Auto-generated after submit'
          />
        </div> */}
      </div>

      <div className='rounded-lg border p-4 space-y-4'>
        <div>
          <h4 className='font-semibold'>{t('legalAssignment')}</h4>
          <p className='text-sm text-muted-foreground'>
            {t('legalAssignmentSub')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>{t('pcnLabel')}</Label>

            {/* <Input
              value={movement.positionItemId ?? ''}
              onChange={(e) => updateMovement('positionItemId', e.target.value)}
              placeholder='position item UUID'
            /> */}
            <PositionItemCombobox
              value={movement.positionItemId}
              selectedLabel={movement.itemNumber}
              onChange={(item) => {
                onChange({
                  ...value,

                  movement: {
                    ...movement,
                    positionItemId: item.id,
                    itemNumber: item.itemNumber,
                    startDate: movement.startDate || value.contract.startDate,
                  },

                  appointment: {
                    //...(value.appointment ?? {}),
                    ...appointment,

                    // default from PCN, but user can override later
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
          </div>

          <div className='space-y-2'>
            <Label>{t('movementRemarks')}</Label>

            <Input
              value={movement.remarks ?? ''}
              onChange={(e) => updateMovement('remarks', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className='rounded-lg border p-4 space-y-4'>
        <div>
          <h4 className='font-semibold'>{t('actualDepartmentLabel')}</h4>
          <p className='text-sm text-muted-foreground'>
            {t('actualAppointmentSub')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>{t('actualDepartmentLabel')}</Label>

            <DepartmentCombobox
              value={appointment.actualDepartmentId ?? null}
              selectedLabel={
                isRtl
                  ? (appointment.actualDepartmentNameAr ??
                    appointment.actualDepartmentNameEn ??
                    undefined)
                  : (appointment.actualDepartmentNameEn ?? undefined)
              }
              onChange={(department) =>
                updateAppointment('actualDepartmentId', department.id)
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('actualPositionLabel')}</Label>

            <PositionCombobox
              value={appointment.actualPositionId ?? null}
              selectedLabel={
                isRtl
                  ? (appointment.actualPositionTitleAr ??
                    appointment.actualPositionTitleEn ??
                    undefined)
                  : (appointment.actualPositionTitleEn ?? undefined)
              }
              onChange={(position) =>
                updateAppointment('actualPositionId', position.id)
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('managerId')}</Label>

            <Input
              value={appointment.managerId ?? ''}
              onChange={(e) =>
                updateAppointment('managerId', e.target.value || null)
              }
              placeholder='optional'
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('appointmentTypeLabel')}</Label>

            <Select
              dir={isRtl ? 'rtl' : 'ltr'}
              value={appointment.appointmentType ?? 'primary'}
              onValueChange={(v) =>
                updateAppointment('appointmentType', v as AppointmentType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {/* <SelectItem value='primary'>{t('primary')}</SelectItem> */}
                <SelectItem value='acting'>{t('primary')}</SelectItem>
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

        <div className='space-y-2'>
          <Label>{t('appointmentRemarks')}</Label>

          <Textarea
            value={appointment.remarks ?? ''}
            onChange={(e) => updateAppointment('remarks', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </section>
  )
}
