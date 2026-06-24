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
import { FormDialog } from '../forms'

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
  isVerified?: boolean
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
    if (!form.issueDate?.trim()) return
    if (!form.expiryDate.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      specialty: form.specialty || null,
      issueDate: form.issueDate || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='space-y-6 px-6 py-1'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              License Details
            </h3>
            <p className='text-xs text-muted-foreground'>
              Enter the professional license number, authority, profession, and
              specialty.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>License Number *</Label>
              <Input
                className='h-11'
                value={form.licenseNumber}
                onChange={(e) => update('licenseNumber', e.target.value)}
                placeholder='2626912923'
              />
            </div>

            <div className='space-y-2'>
              <Label>Issuing Authority *</Label>
              <Input
                className='h-11'
                value={form.authority}
                onChange={(e) => update('authority', e.target.value)}
                placeholder='Saudi Commission for Health Specialties'
              />
            </div>

            <div className='space-y-2'>
              <Label>Profession *</Label>
              <Input
                className='h-11'
                value={form.profession ?? ''}
                onChange={(e) => update('profession', e.target.value)}
                placeholder='Nurse'
              />
            </div>

            <div className='space-y-2'>
              <Label>Specialty</Label>
              <Input
                className='h-11'
                value={form.specialty ?? ''}
                onChange={(e) => update('specialty', e.target.value || null)}
                placeholder='Emergency Nursing'
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              Validity Period
            </h3>
            <p className='text-xs text-muted-foreground'>
              Add the license issue and expiry dates.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Issue Date *</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.issueDate ?? ''}
                onChange={(e) => update('issueDate', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Expiry Date *</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      <DialogFooter className='border-t bg-muted/40 px-6 py-6'>
        <Button
          type='button'
          className='p-4'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>

        <Button
          type='button'
          className='bg-slate-950 p-4 text-white hover:bg-slate-800'
          onClick={handleSubmit}
        >
          Save License
        </Button>
      </DialogFooter>
    </>
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit License' : 'Add License'}
      description="Enter the employee's obtained license details."
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <LicenseDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </FormDialog>
  )
}
