'use client'

import { useState } from 'react'

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

export type MalpracticeFormValue = {
  id?: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  isVerified?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: MalpracticeFormValue | null
  onSubmit: (value: MalpracticeFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: MalpracticeFormValue = {
  insuranceCompany: '',
  policyNumber: '',
  coverageAmount: null,
  startDate: null,
  expiryDate: null,
  documentFileId: null,
  isVerified: false,
}

function MalpracticeDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: MalpracticeFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: MalpracticeFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<MalpracticeFormValue>(
    initialValue ?? emptyValue,
  )

  function update<K extends keyof MalpracticeFormValue>(
    field: K,
    value: MalpracticeFormValue[K],
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

    return `malpractice-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.insuranceCompany.trim()) return
    if (!form.policyNumber.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      coverageAmount: form.coverageAmount || null,
      startDate: form.startDate || null,
      expiryDate: form.expiryDate || null,
      documentFileId: form.documentFileId || null,
      isVerified: form.isVerified ?? false,
    })

    onOpenChange(false)
  }

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>
          {initialValue
            ? 'Edit Malpractice Insurance'
            : 'Add Malpractice Insurance'}
        </DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s malpractice insurance details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Insurance Company *</Label>
          <Input
            value={form.insuranceCompany}
            onChange={(e) => update('insuranceCompany', e.target.value)}
            placeholder='Insurance Company'
          />
        </div>

        <div className='space-y-2'>
          <Label>Policy Number *</Label>
          <Input
            value={form.policyNumber}
            onChange={(e) => update('policyNumber', e.target.value)}
            placeholder='POL-123456'
          />
        </div>

        <div className='space-y-2'>
          <Label>Coverage Amount</Label>
          <Input
            type='number'
            value={form.coverageAmount ?? ''}
            onChange={(e) => update('coverageAmount', e.target.value || null)}
            placeholder='0.00'
          />
        </div>

        <div className='space-y-2'>
          <Label>Start Date</Label>
          <Input
            type='date'
            value={form.startDate ?? ''}
            onChange={(e) => update('startDate', e.target.value || null)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Expiry Date</Label>
          <Input
            type='date'
            value={form.expiryDate ?? ''}
            onChange={(e) => update('expiryDate', e.target.value || null)}
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
          Save Malpractice
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function MalpracticeDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-malpractice' : 'closed')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <MalpracticeDialogContent
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
