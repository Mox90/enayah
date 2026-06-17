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

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function ContractInformation({ value, onChange }: Props) {
  const contract = value.contract

  function updateContract(field: keyof typeof contract, fieldValue: any) {
    onChange({
      ...value,
      contract: {
        ...contract,
        [field]: fieldValue,
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Contract Information</h3>

        <p className='text-sm text-muted-foreground'>
          Legal employment contract information.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* <div className='space-y-2'>
          <Label>Contract Number</Label>

          <Input
            value={contract.contractNumber ?? ''}
            disabled
            placeholder='Auto-generated upon hiring'
          />
        </div> */}

        <div className='space-y-2'>
          <Label>Contract Type</Label>

          <Select
            value={contract.contractType}
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

        <div className='space-y-2'>
          <Label>Status</Label>

          <Select
            value={contract.status ?? 'active'}
            onValueChange={(v) => updateContract('status', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='draft'>Draft</SelectItem>

              <SelectItem value='active'>Active</SelectItem>

              <SelectItem value='superseded'>Superseded</SelectItem>

              <SelectItem value='cancelled'>Cancelled</SelectItem>

              <SelectItem value='expired'>Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Start Date *</Label>

          <Input
            type='date'
            value={contract.startDate ?? ''}
            onChange={(e) => updateContract('startDate', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>End Date *</Label>

          <Input
            type='date'
            value={contract.endDate ?? ''}
            onChange={(e) => updateContract('endDate', e.target.value)}
          />
        </div>

        {/* <div className='space-y-2'>
          <Label>Signed Date</Label>

          <Input
            type='date'
            value={contract.signedDate ?? ''}
            onChange={(e) => updateContract('signedDate', e.target.value)}
          />
        </div> */}
      </div>

      <div className='space-y-2'>
        <Label>Notes</Label>

        <Textarea
          value={contract.notes ?? ''}
          onChange={(e) => updateContract('notes', e.target.value)}
          rows={3}
        />
      </div>
    </section>
  )
}
