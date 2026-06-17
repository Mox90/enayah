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
import {
  HireEmployeePayload,
  IdentificationInput,
} from '@/modules/hr/onboarding/types/onboarding.types'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmployeeIdentificationInformation({ value, onChange }: Props) {
  const identification = value.personal?.identifications?.[0]

  function updateIdentification<K extends keyof IdentificationInput>(
    field: K,
    fieldValue: IdentificationInput[K],
  ) {
    const nextIdentification = {
      type: identification?.type ?? 'iqama',
      identificationNumber: identification?.identificationNumber ?? '',
      issueDate: identification?.issueDate ?? null,
      expiryDate: identification?.expiryDate ?? null,
      isCurrent: true,
      ...identification,
      [field]: fieldValue,
    }

    onChange({
      ...value,
      personal: {
        ...value.personal,
        identifications: nextIdentification.identificationNumber
          ? [nextIdentification]
          : [],
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Identification</h3>
        <p className='text-sm text-muted-foreground'>
          National ID, Iqama, Passport, GCC ID, or other identification.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Identification Type</Label>
          <Select
            value={identification?.type ?? 'iqama'}
            onValueChange={(v) =>
              updateIdentification('type', v as IdentificationInput['type'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='national_id'>National ID</SelectItem>
              <SelectItem value='iqama'>Iqama</SelectItem>
              <SelectItem value='gcc_id'>GCC ID</SelectItem>
              <SelectItem value='passport'>Passport</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Identification Number</Label>
          <Input
            value={identification?.identificationNumber ?? ''}
            onChange={(e) =>
              updateIdentification('identificationNumber', e.target.value)
            }
          />
        </div>

        <div className='space-y-2'>
          <Label>Issue Date</Label>
          <Input
            type='date'
            value={identification?.issueDate ?? ''}
            onChange={(e) =>
              updateIdentification('issueDate', e.target.value || null)
            }
          />
        </div>

        <div className='space-y-2'>
          <Label>Expiry Date</Label>
          <Input
            type='date'
            value={identification?.expiryDate ?? ''}
            onChange={(e) =>
              updateIdentification('expiryDate', e.target.value || null)
            }
          />
        </div>
      </div>
    </section>
  )
}
