'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { useLocale, useTranslations } from 'next-intl'
import { DialogFooter } from '../ui/dialog'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'

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
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<FellowshipFormValue>(
    initialValue ?? emptyValue,
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const fellowshipName = form.fellowshipName.trim()
  const issuingBody = form.issuingBody.trim()

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

  const formInvalid = !fellowshipName || !issuingBody

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
        abbreviation: form.abbreviation || null,
        specialty: form.specialty || null,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        documentFileId: form.documentFileId || null,
        isVerified: form.isVerified ?? false,
      })

      onOpenChange(false)
    } catch (error) {
      // Keep the dialog open.
      // The parent mutation hook can display the error toast.
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

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={t('save', {
          item: isRtl ? 'زمالة' : 'Fellowship',
        })}
        savingLabel={t('saving', { item: 'fellowship' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
