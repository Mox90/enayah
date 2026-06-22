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

export type FellowshipFormValue = {
  id?: string
  fellowshipName: string
  abbreviation?: string | null
  issuingBody: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  isVerified: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: FellowshipFormValue | null
  onSubmit: (value: FellowshipFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: FellowshipFormValue = {
  fellowshipName: '',
  abbreviation: null,
  issuingBody: '',
  specialty: null,
  issueDate: null,
  expiryDate: null,
  documentFileId: null,
  isVerified: false,
}

function FellowshipDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: FellowshipFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: FellowshipFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<FellowshipFormValue>(
    initialValue ?? emptyValue,
  )

  function update<K extends keyof FellowshipFormValue>(
    field: K,
    value: FellowshipFormValue[K],
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

    return `fellowship-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.fellowshipName.trim()) return
    if (!form.issuingBody.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      abbreviation: form.abbreviation || null,
      specialty: form.specialty || null,
      issueDate: form.issueDate || null,
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
          {initialValue ? 'Edit Fellowship' : 'Add Fellowship'}
        </DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s fellowship qualification details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Fellowship Name *</Label>
          <Input
            value={form.fellowshipName}
            onChange={(e) => update('fellowshipName', e.target.value)}
            placeholder='Fellowship in Cardiology'
          />
        </div>

        <div className='space-y-2'>
          <Label>Abbreviation</Label>
          <Input
            value={form.abbreviation ?? ''}
            onChange={(e) => update('abbreviation', e.target.value || null)}
            placeholder='FACC'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issuing Body *</Label>
          <Input
            value={form.issuingBody}
            onChange={(e) => update('issuingBody', e.target.value)}
            placeholder='American College of Cardiology'
          />
        </div>

        <div className='space-y-2'>
          <Label>Specialty</Label>
          <Input
            value={form.specialty ?? ''}
            onChange={(e) => update('specialty', e.target.value || null)}
            placeholder='Cardiology'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issue Date</Label>
          <Input
            type='date'
            value={form.issueDate ?? ''}
            onChange={(e) => update('issueDate', e.target.value || null)}
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
          Save Fellowship
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function FellowshipDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-fellowship' : 'closed')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <FellowshipDialogContent
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
