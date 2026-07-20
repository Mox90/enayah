'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

export type MalpracticeFormValue = {
  id?: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate: string
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
  expiryDate: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const insuranceCompany = form.insuranceCompany.trim()
  const policyNumber = form.policyNumber.trim()
  const expiryDate = form.expiryDate?.trim()

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

  const formInvalid = !insuranceCompany || !policyNumber || !expiryDate

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
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
        expiryDate,
        documentFileId: form.documentFileId || null,
        isVerified: form.isVerified ?? false,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
                value={insuranceCompany}
                onChange={(e) => update('insuranceCompany', e.target.value)}
                placeholder='Insurance Company'
              />
            </div>

            <div className='space-y-2'>
              <Label>Policy Number *</Label>
              <Input
                className='h-11'
                value={policyNumber}
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
                value={expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={crt('save', {
          item: isRtl
            ? 'وثيقة التأمين ضد الأخطاء المهنية'
            : 'Malpractice Policy',
        })}
        savingLabel={crt('saving', { item: 'malpractice insurance policy' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
