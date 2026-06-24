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
      //coverageAmount: form.coverageAmount || null,
      coverageAmount:
        form.coverageAmount === '' ||
        form.coverageAmount === null ||
        form.coverageAmount === undefined
          ? null
          : form.coverageAmount,
      startDate: form.startDate || null,
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
              Insurance Details
            </h3>
            <p className='text-xs text-muted-foreground'>
              Enter the insurance company, policy number, and coverage amount.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Insurance Company *</Label>
              <Input
                className='h-11'
                value={form.insuranceCompany}
                onChange={(e) => update('insuranceCompany', e.target.value)}
                placeholder='Insurance Company'
              />
            </div>

            <div className='space-y-2'>
              <Label>Policy Number *</Label>
              <Input
                className='h-11'
                value={form.policyNumber}
                onChange={(e) => update('policyNumber', e.target.value)}
                placeholder='POL-123456'
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>Coverage Amount</Label>
              <Input
                type='number'
                min='0' // Prevents browser arrow button decrements below 0
                className='h-11'
                value={form.coverageAmount ?? ''}
                onChange={(e) => {
                  const val = e.target.value

                  // Prevent manual typing of negative numbers
                  if (val !== '' && Number(val) < 0) return

                  update('coverageAmount', val || null)
                }}
                placeholder='0.00'
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
              Add the insurance start and expiry dates if available.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Start Date</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.startDate ?? ''}
                onChange={(e) => update('startDate', e.target.value || null)}
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
          Save Malpractice
        </Button>
      </DialogFooter>
    </>
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        initialValue
          ? 'Edit Malpractice Insurance'
          : 'Add Malpractice Insurance'
      }
      description="Enter the employee's malpractice insurance details."
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <MalpracticeDialogContent
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
