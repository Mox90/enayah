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

export type MembershipFormValue = {
  id?: string
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  isVerified: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: MembershipFormValue | null
  onSubmit: (value: MembershipFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: MembershipFormValue = {
  organization: '',
  membershipNumber: null,
  membershipLevel: null,
  startDate: null,
  expiryDate: null,
  documentFileId: null,
  isVerified: false,
}

function MembershipDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: MembershipFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: MembershipFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<MembershipFormValue>(
    initialValue ?? emptyValue,
  )

  function update<K extends keyof MembershipFormValue>(
    field: K,
    value: MembershipFormValue[K],
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

    return `membership-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.organization.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      membershipNumber: form.membershipNumber || null,
      membershipLevel: form.membershipLevel || null,
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
              Membership Details
            </h3>
            <p className='text-xs text-muted-foreground'>
              Enter the professional organization and membership number.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2 xl:col-span-2'>
              <Label>Organization *</Label>
              <Input
                className='h-11'
                value={form.organization}
                onChange={(e) => update('organization', e.target.value)}
                placeholder='Saudi Commission for Health Specialties'
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>Membership Number</Label>
              <Input
                className='h-11'
                value={form.membershipNumber ?? ''}
                onChange={(e) =>
                  update('membershipNumber', e.target.value || null)
                }
                placeholder='MEM-123456'
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
              Add the membership start and expiry dates if available.
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
          Save Membership
        </Button>
      </DialogFooter>
    </>
  )
}

export function MembershipDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-membership' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Membership' : 'Add Membership'}
      description="Enter the employee's professional membership details."
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <MembershipDialogContent
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
