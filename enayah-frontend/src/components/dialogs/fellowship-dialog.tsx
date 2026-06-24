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
import { FormDialog } from '../forms'

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
    <>
      <div className='space-y-6 px-6 py-1'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              Fellowship Qualification
            </h3>
            <p className='text-xs text-muted-foreground'>
              Enter the fellowship name, abbreviation, specialty, and issuing
              body.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2 xl:col-span-2'>
              <Label>Fellowship Name *</Label>
              <Input
                className='h-11'
                value={form.fellowshipName}
                onChange={(e) => update('fellowshipName', e.target.value)}
                placeholder='Fellowship in Cardiology'
              />
            </div>

            <div className='space-y-2'>
              <Label>Abbreviation</Label>
              <Input
                className='h-11'
                value={form.abbreviation ?? ''}
                onChange={(e) => update('abbreviation', e.target.value || null)}
                placeholder='FACC'
              />
            </div>

            <div className='space-y-2'>
              <Label>Specialty</Label>
              <Input
                className='h-11'
                value={form.specialty ?? ''}
                onChange={(e) => update('specialty', e.target.value || null)}
                placeholder='Cardiology'
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>Issuing Body *</Label>
              <Input
                className='h-11'
                value={form.issuingBody}
                onChange={(e) => update('issuingBody', e.target.value)}
                placeholder='American College of Cardiology'
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
              Add the issue and expiry dates if available.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Issue Date</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.issueDate ?? ''}
                onChange={(e) => update('issueDate', e.target.value || null)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Expiry Date</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value || null)}
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
          Save Fellowship
        </Button>
      </DialogFooter>
    </>
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Fellowship' : 'Add Fellowship'}
      description="Enter the employee's fellowship qualification details."
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <FellowshipDialogContent
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
