'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type LicenseFormValue = {
  id?: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'revoked'
  isPrimary: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: LicenseFormValue | null
  onSubmit: (value: LicenseFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: LicenseFormValue = {
  authority: '',
  licenseNumber: '',
  profession: '',
  specialty: '',
  issueDate: '',
  expiryDate: '',
  status: 'active',
  isPrimary: false,
}

function LicenseDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: LicenseFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: LicenseFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<LicenseFormValue>(initialValue ?? emptyValue)

  function update<K extends keyof LicenseFormValue>(
    field: K,
    value: LicenseFormValue[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function createClientId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `license-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.authority.trim()) return
    if (!form.licenseNumber.trim()) return
    if (!form.profession.trim()) return
    if (!form.expiryDate.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      specialty: form.specialty || null,
      issueDate: form.issueDate || null,
    })
    //console.log('DATA INPUT IS ', form)
    onOpenChange(false)
  }

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>{initialValue ? 'Edit Degree' : 'Add Degree'}</DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s obtained license details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>License Number *</Label>
          <Input
            value={form.licenseNumber}
            onChange={(e) => update('licenseNumber', e.target.value)}
            placeholder='2626912923'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issuing Authority *</Label>
          <Input
            value={form.authority}
            onChange={(e) => update('authority', e.target.value)}
            placeholder='Saudi Commission for Health Specialties'
          />
        </div>

        <div className='space-y-2'>
          <Label>Profession</Label>
          <Input
            value={form.profession ?? ''}
            onChange={(e) => update('profession', e.target.value)}
            placeholder='Nurse'
          />
        </div>

        <div className='space-y-2'>
          <Label>Specialty</Label>
          <Input
            value={form.specialty ?? ''}
            onChange={(e) => update('specialty', e.target.value)}
            placeholder='Nurse'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issue Date *</Label>
          <Input
            type='date'
            value={form.issueDate ?? ''}
            onChange={(e) => update('issueDate', e.target.value)}
            placeholder='University Name'
          />
        </div>

        <div className='space-y-2'>
          <Label>Expiry Date *</Label>
          <Input
            type='date'
            value={form.expiryDate ?? ''}
            onChange={(e) => update('expiryDate', e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>

        <Button type='button' onClick={handleSubmit}>
          Save Degree
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function LicenseDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-license' : 'closed')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <LicenseDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </Dialog>
  )
}
