// src/modules/hr/employees/components/onboarding/sections/employment-contract-assignment-information.tsx

'use client'

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
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmploymentContractAssignmentInformation({
  value,
  onChange,
}: Props) {
  const employment = value.employment
  const contract = value.contract
  const movement = value.movement
  const appointment = value.appointment ?? {
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

  function updateEffectiveDate(date: string) {
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

  function updateContractEndDate(date: string) {
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

  function updateEmployment(field: keyof typeof employment, fieldValue: any) {
    onChange({
      ...value,
      employment: {
        ...employment,
        [field]: fieldValue,
      },
    })
  }

  function updateContract(field: keyof typeof contract, fieldValue: any) {
    onChange({
      ...value,
      contract: {
        ...contract,
        [field]: fieldValue,
      },
    })
  }

  function updateMovement(field: keyof typeof movement, fieldValue: any) {
    onChange({
      ...value,
      movement: {
        ...movement,
        [field]: fieldValue,
      },
    })
  }

  function updateAppointment(field: string, fieldValue: any) {
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
        <h3 className='text-lg font-semibold'>
          Employment, Contract & Assignment
        </h3>

        <p className='text-sm text-muted-foreground'>
          Initial employment record, first contract, legal PCN assignment, and
          actual appointment.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Hire Date *</Label>

          <Input
            type='date'
            value={employment.hireDate ?? ''}
            onChange={(e) => updateEffectiveDate(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>End Date *</Label>

          <Input
            type='date'
            value={contract.endDate ?? ''}
            onChange={(e) => updateContractEndDate(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Employment Type</Label>

          <Select
            value={employment.employmentType}
            onValueChange={(v) => updateEmployment('employmentType', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='full_time'>Full Time</SelectItem>
              <SelectItem value='part_time'>Part Time</SelectItem>
              <SelectItem value='contract'>Contract</SelectItem>
              <SelectItem value='temporary'>Temporary</SelectItem>
              <SelectItem value='locum'>Locum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Staff Category</Label>

          <Select
            value={employment.staffCategory}
            onValueChange={(v) => updateEmployment('staffCategory', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='civilian'>Civilian</SelectItem>
              <SelectItem value='military'>Military</SelectItem>
              <SelectItem value='contractual'>Contractual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Contract Type</Label>

          <Select
            value={contract.contractType ?? 'initial'}
            onValueChange={(v) => updateContract('contractType', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='initial'>Initial</SelectItem>
              <SelectItem value='renewal'>Renewal</SelectItem>
              <SelectItem value='amendment'>Amendment</SelectItem>
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
          <h4 className='font-semibold'>Legal Assignment / PCN</h4>
          <p className='text-sm text-muted-foreground'>
            Select the vacant position item that will fund this employee.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Position Item ID *</Label>

            {/* <Input
              value={movement.positionItemId ?? ''}
              onChange={(e) => updateMovement('positionItemId', e.target.value)}
              placeholder='position item UUID'
            /> */}
            <PositionItemCombobox
              value={movement.positionItemId}
              onChange={(item) => {
                onChange({
                  ...value,

                  movement: {
                    ...movement,
                    positionItemId: item.id,
                    startDate: movement.startDate || value.contract.startDate,
                  },

                  appointment: {
                    ...(value.appointment ?? {}),
                    actualDepartmentId: item.departmentId,
                    actualPositionId: item.positionId,
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
            <Label>Movement Remarks</Label>

            <Input
              value={movement.remarks ?? ''}
              onChange={(e) => updateMovement('remarks', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className='rounded-lg border p-4 space-y-4'>
        <div>
          <h4 className='font-semibold'>Actual Appointment</h4>
          <p className='text-sm text-muted-foreground'>
            Optional. If left blank, backend will default actual department and
            position from the selected PCN.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Actual Department ID</Label>

            <Input
              value={(appointment as any).actualDepartmentId ?? ''}
              onChange={(e) =>
                updateAppointment('actualDepartmentId', e.target.value || null)
              }
              placeholder='optional'
            />
          </div>

          <div className='space-y-2'>
            <Label>Actual Position ID</Label>

            <Input
              value={(appointment as any).actualPositionId ?? ''}
              onChange={(e) =>
                updateAppointment('actualPositionId', e.target.value || null)
              }
              placeholder='optional'
            />
          </div>

          <div className='space-y-2'>
            <Label>Manager ID</Label>

            <Input
              value={(appointment as any).managerId ?? ''}
              onChange={(e) =>
                updateAppointment('managerId', e.target.value || null)
              }
              placeholder='optional'
            />
          </div>

          <div className='space-y-2'>
            <Label>Appointment Type</Label>

            <Select
              value={(appointment as any).appointmentType ?? 'primary'}
              onValueChange={(v) => updateAppointment('appointmentType', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='primary'>Primary</SelectItem>
                <SelectItem value='acting'>Acting</SelectItem>
                <SelectItem value='temporary'>Temporary</SelectItem>
                <SelectItem value='rotation'>Rotation</SelectItem>
                <SelectItem value='secondment'>Secondment</SelectItem>
                <SelectItem value='concurrent'>Concurrent</SelectItem>
                <SelectItem value='permanent_transfer'>
                  Permanent Transfer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Appointment Remarks</Label>

          <Textarea
            value={(appointment as any).remarks ?? ''}
            onChange={(e) => updateAppointment('remarks', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </section>
  )
}
