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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { useProviderOptions } from '@/modules/hr/compensations/utils/provider-options'
import { ProviderCombobox } from '../comboboxes/provider-combobox'

export type LifeSupportType =
  | 'bls'
  | 'acls'
  | 'pals'
  | 'atls'
  | 'stls'
  | 'nrp'
  | 'itls'
  | 'blso'
  | 'atcn'
  | 'also'
  | 'tncc'
  | 'enpc'
  | 'asls'
  | 'esls'
  | 'pfccs'
  | 'other'

export type LifeSupportFormValue = {
  id?: string
  type: LifeSupportType
  provider: string
  certificateNumber?: string | null
  issueDate?: string | null
  expiryDate: string
  documentFileId?: string | null
  isVerified?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: LifeSupportFormValue | null
  onSubmit: (value: LifeSupportFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: LifeSupportFormValue = {
  type: 'bls',
  provider: '',
  certificateNumber: null,
  issueDate: null,
  expiryDate: '',
  documentFileId: null,
  isVerified: false,
}

function LifeSupportDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: LifeSupportFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: LifeSupportFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<LifeSupportFormValue>(
    initialValue ?? emptyValue,
  )
  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const providerOptions = useProviderOptions()

  function update<K extends keyof LifeSupportFormValue>(
    field: K,
    value: LifeSupportFormValue[K],
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

    return `life-support-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.type) return
    if (!form.provider.trim()) return
    if (!form.expiryDate.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      certificateNumber: form.certificateNumber || null,
      issueDate: form.issueDate || null,
      //documentFileId: form.documentFileId || null,
      isVerified: form.isVerified ?? false,
    })

    onOpenChange(false)
  }

  // function getAvailableAllowanceTypes(currentIndex: number) {
  //   const selected = new Set(
  //     (value.providers ?? [])
  //       .filter((_, index) => index !== currentIndex)
  //       .map((allowance) => allowance.type),
  //   )

  //   return providerOptions.filter((option) => !selected.has(option.value))
  // }

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>
          {initialValue ? 'Edit Life Support' : 'Add Life Support'}
        </DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s life support certification details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Type *</Label>
          <Select
            dir={isRtl ? 'rtl' : 'ltr'}
            value={form.type}
            onValueChange={(v) => update('type', v as LifeSupportType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
              <SelectItem value='acls'>{crt('acls')}</SelectItem>
              <SelectItem value='also'>{crt('also')}</SelectItem>
              <SelectItem value='asls'>{crt('asls')}</SelectItem>
              <SelectItem value='atcn'>{crt('atcn')}</SelectItem>
              <SelectItem value='atls'>{crt('atls')}</SelectItem>
              <SelectItem value='bls'>{crt('bls')}</SelectItem>
              <SelectItem value='blso'>{crt('blso')}</SelectItem>
              <SelectItem value='enpc'>{crt('enpc')}</SelectItem>
              <SelectItem value='esls'>{crt('esls')}</SelectItem>
              <SelectItem value='itls'>{crt('itls')}</SelectItem>
              <SelectItem value='nrp'>{crt('nrp')}</SelectItem>
              <SelectItem value='pals'>{crt('pals')}</SelectItem>
              <SelectItem value='pfccs'>{crt('pfccs')}</SelectItem>
              <SelectItem value='stls'>{crt('stls')}</SelectItem>
              <SelectItem value='tncc'>{crt('tncc')}</SelectItem>
              <SelectItem value='other'>{crt('other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Provider *</Label>
          {/* <Input
            value={form.provider}
            onChange={(e) => update('provider', e.target.value)}
            placeholder='Saudi Heart Association'
          /> */}
          <ProviderCombobox
            value={form.provider}
            options={providerOptions}
            onChange={(provider) => update('provider', provider)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Certificate Number</Label>
          <Input
            value={form.certificateNumber ?? ''}
            onChange={(e) =>
              update('certificateNumber', e.target.value || null)
            }
            placeholder='CERT-123456'
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
          <Label>Expiry Date *</Label>
          <Input
            type='date'
            value={form.expiryDate}
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
          Save Life Support
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function LifeSupportDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-life-support' : 'closed')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <LifeSupportDialogContent
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
