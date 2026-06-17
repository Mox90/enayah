'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function AssignmentInformation({ value, onChange }: Props) {
  const movement = value.movement

  function updateMovement(field: keyof typeof movement, fieldValue: any) {
    onChange({
      ...value,
      movement: {
        ...movement,
        [field]: fieldValue,
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Initial Assignment</h3>

        <p className='text-sm text-muted-foreground'>
          Select the official Position Item (PCN) for this employee.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Position Item (PCN) *</Label>

          <Input
            placeholder='Lookup vacant PCN...'
            value={movement.positionItemId ?? ''}
            onChange={(e) => updateMovement('positionItemId', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Department</Label>

          <Input value={movement.officialDepartmentId ?? ''} disabled />
        </div>

        <div className='space-y-2'>
          <Label>Position</Label>

          <Input value={movement.officialPositionId ?? ''} disabled />
        </div>

        <div className='space-y-2'>
          <Label>Effective Date</Label>

          <Input
            type='date'
            value={movement.startDate ?? value.contract.startDate}
            onChange={(e) => updateMovement('startDate', e.target.value)}
          />
        </div>
      </div>
    </section>
  )
}
