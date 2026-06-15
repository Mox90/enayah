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

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmploymentInformation({ value, onChange }: Props) {
  const employment = value.employment

  function updateEmployment(field: keyof typeof employment, fieldValue: any) {
    onChange({
      ...value,

      employment: {
        ...employment,

        [field]: fieldValue,
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Employment Information</h3>

        <p className='text-sm text-muted-foreground'>
          Employment master record.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Hire Date *</Label>

          <Input
            type='date'
            value={employment.hireDate ?? ''}
            onChange={(e) => updateEmployment('hireDate', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Start Date *</Label>

          <Input
            type='date'
            value={employment.startDate ?? ''}
            onChange={(e) => updateEmployment('startDate', e.target.value)}
          />
        </div>

        {/* <div className='space-y-2'>
          <Label>End Date</Label>

          <Input
            type='date'
            value={employment.endDate ?? ''}
            onChange={(e) => updateEmployment('endDate', e.target.value)}
          />
        </div> */}

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
      </div>
    </section>
  )
}
