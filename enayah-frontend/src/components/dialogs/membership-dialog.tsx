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
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>
          {initialValue ? 'Edit Membership' : 'Add Membership'}
        </DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s professional membership details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Organization *</Label>
          <Input
            value={form.organization}
            onChange={(e) => update('organization', e.target.value)}
            placeholder='Saudi Commission for Health Specialties'
          />
        </div>

        <div className='space-y-2'>
          <Label>Membership Number</Label>
          <Input
            value={form.membershipNumber ?? ''}
            onChange={(e) => update('membershipNumber', e.target.value || null)}
            placeholder='MEM-123456'
          />
        </div>

        {/* <div className='space-y-2'>
          <Label>Membership Level</Label>
          <Input
            value={form.membershipLevel ?? ''}
            onChange={(e) => update('membershipLevel', e.target.value || null)}
            placeholder='Fellow / Member / Associate'
          />
        </div> */}

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
          Save Membership
        </Button>
      </DialogFooter>
    </DialogContent>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <MembershipDialogContent
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
