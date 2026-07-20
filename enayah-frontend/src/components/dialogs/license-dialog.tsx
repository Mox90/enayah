'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { useLocale, useTranslations } from 'next-intl'
import { Save } from 'lucide-react'

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
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<LicenseFormValue>(initialValue ?? emptyValue)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const authority = form.authority.trim()
  const licenseNumber = form.licenseNumber.trim()
  const specialty = form.specialty?.trim()
  const profession = form.profession.trim()
  const issueDate = form.issueDate?.trim()
  const expiryDate = form.expiryDate.trim()

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

  const formInvalid = !authority || !licenseNumber || !profession || !expiryDate

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    // if (!form.authority.trim()) return
    // if (!form.licenseNumber.trim()) return
    // if (!form.profession.trim()) return
    // if (!form.issueDate?.trim()) return
    // if (!form.expiryDate.trim()) return
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id ?? (generateId ? createClientId() : undefined),
        specialty: form.specialty || null,
        issueDate: form.issueDate || null,
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

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={t('save', {
          item: isRtl ? 'رخصة' : 'License',
        })}
        savingLabel={t('saving', { item: 'license' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
