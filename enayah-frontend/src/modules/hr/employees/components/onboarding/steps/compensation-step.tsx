'use client'

import { AllowanceTypeCombobox } from '@/components/comboboxes/allowance-combobox'
import { DatePicker } from '@/components/dialogs/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAllowanceOptions } from '@/modules/hr/compensations/utils/allowance-options'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { Trash2 } from 'lucide-react'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function CompensationStep({ value, onChange }: Props) {
  const allowanceOptions = useAllowanceOptions()
  const compensation = value.compensation ?? {
    effectiveDate: value.contract.startDate,
    baseSalary: 0,
    status: 'approved',
    reason: '',
  }

  function updateCompensation<
    K extends keyof NonNullable<HireEmployeePayload['compensation']>,
  >(field: K, fieldValue: NonNullable<HireEmployeePayload['compensation']>[K]) {
    onChange({
      ...value,
      compensation: {
        ...compensation,
        [field]: fieldValue,
      },
    })
  }

  function addAllowance() {
    onChange({
      ...value,
      allowances: [
        ...(value.allowances ?? []),
        {
          type: '',
          amount: 0,
        },
      ],
    })
  }

  function updateAllowance(
    index: number,
    field: 'type' | 'amount',
    fieldValue: string,
  ) {
    const allowances = [...(value.allowances ?? [])]

    allowances[index] = {
      ...allowances[index],
      [field]: field === 'amount' ? Number(fieldValue) : fieldValue,
    }

    onChange({
      ...value,
      allowances,
    })
  }

  function removeAllowance(index: number) {
    onChange({
      ...value,
      allowances: (value.allowances ?? []).filter((_, i) => i !== index),
    })
  }

  function getAvailableAllowanceTypes(currentIndex: number) {
    const selected = new Set(
      (value.allowances ?? [])
        .filter((_, index) => index !== currentIndex)
        .map((allowance) => allowance.type),
    )

    return allowanceOptions.filter((option) => !selected.has(option.value))
  }

  return (
    <section className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold'>Compensation Information</h3>

        <p className='text-sm text-muted-foreground'>
          Initial salary and compensation details.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          {/* <Label>Effective Date</Label>

          <Input
            type='date'
            value={compensation.effectiveDate}
            onChange={(e) =>
              updateCompensation('effectiveDate', e.target.value)
            }
          /> */}
          <label
            htmlFor={'effectiveDate'}
            className='text-xs text-muted-foreground block'
          >
            {'Effective Date'}
          </label>

          <DatePicker
            id='effectiveDate'
            value={compensation.effectiveDate}
            onChange={(value) => updateCompensation('effectiveDate', value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Base Salary</Label>

          <Input
            type='number'
            value={compensation.baseSalary}
            onChange={(e) =>
              updateCompensation('baseSalary', Number(e.target.value))
            }
          />
        </div>

        <div className='space-y-2'>
          <Label>Status</Label>

          <Select
            value={compensation.status}
            onValueChange={(v) =>
              updateCompensation(
                'status',
                v as NonNullable<HireEmployeePayload['compensation']>['status'],
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='draft'>Draft</SelectItem>
              <SelectItem value='approved'>Approved</SelectItem>
              <SelectItem value='applied'>Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Reason</Label>

          <Input
            value={compensation.reason ?? ''}
            onChange={(e) => updateCompensation('reason', e.target.value)}
            placeholder='Initial salary'
          />
        </div>
      </div>

      <div className='space-y-4 rounded-lg border p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='font-semibold'>Allowances</h4>
            <p className='text-sm text-muted-foreground'>
              Optional compensation allowances.
            </p>
          </div>

          <Button type='button' variant='outline' onClick={addAllowance}>
            Add Allowance
          </Button>
        </div>

        <div className='space-y-3'>
          {(value.allowances?.length ?? 0) > 0 && (
            <div className='grid grid-cols-[1fr_160px_40px] items-end gap-3'>
              <div className='space-y-2'>
                <Label>Allowance Type</Label>
              </div>
              <div className='space-y-2'>
                <Label>Amount</Label>
              </div>
            </div>
          )}

          {(value.allowances ?? []).map((allowance, index) => (
            <div
              key={index}
              className='grid grid-cols-[1fr_160px_40px] items-end gap-3'
            >
              <div className='space-y-2'>
                {/* <Label>Allowance Type</Label> */}
                {/* <Input
                  value={allowance.type}
                  onChange={(e) =>
                    updateAllowance(index, 'type', e.target.value)
                  }
                  placeholder='Housing'
                /> */}
                <AllowanceTypeCombobox
                  value={allowance.type}
                  options={getAvailableAllowanceTypes(index)}
                  onChange={(selectedType) =>
                    updateAllowance(index, 'type', selectedType)
                  }
                />
              </div>

              <div className='space-y-2'>
                {/* <Label>Amount</Label> */}
                <Input
                  type='number'
                  value={allowance.amount}
                  onChange={(e) =>
                    updateAllowance(index, 'amount', e.target.value)
                  }
                  placeholder='0'
                />
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeAllowance(index)}
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
          ))}

          {!value.allowances?.length && (
            <p className='text-sm text-muted-foreground'>
              No allowances added.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
