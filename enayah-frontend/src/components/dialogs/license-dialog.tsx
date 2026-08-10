// enayah-frontend/src/components/dialogs/license-dialog.tsx

'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { useLocale, useTranslations } from 'next-intl'
import { Save } from 'lucide-react'
import { CredentialDocumentMetadata } from '@/modules/hr/credentials/types/credential-document.types'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { licenseDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { CredentialDocumentDropzone } from '../forms/credential-document-dropzone'

export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'revoked'

export type LicenseFormValue = {
  id?: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string | null
  //status?: LicenseStatus //'active' | 'expired' | 'suspended' | 'revoked'
  isPrimary: boolean

  /*
   * Read-only verification state.
   * It is not submitted through the normal board form.
   */
  isVerified?: boolean | null

  /*
   * Existing document metadata when editing.
   * This is not submitted to the backend.
   */
  document?: CredentialDocumentMetadata | null
}

export type LicenseFormSubmitValue = {
  id?: string
  clientId?: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string | null
  //status?: LicenseStatus //'active' | 'expired' | 'suspended' | 'revoked'
  documentFile: File | null
  isPrimary: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: LicenseFormValue | null
  onSubmit: (value: LicenseFormSubmitValue) => void | Promise<void>
  generateId?: boolean
  /*
   * Existing employee profile:
   * true — allow immediate upload.
   *
   * Onboarding:
   * false — employee record may not exist yet.
   */
  allowDocumentUpload?: boolean
  employeeId?: string
}

const emptyValue: LicenseFormValue = {
  authority: '',
  licenseNumber: '',
  profession: '',
  specialty: '',
  issueDate: '',
  expiryDate: '',
  //status: 'active',
  isPrimary: false,
  isVerified: false,
  document: null,
}

function LicenseDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  initialValue?: LicenseFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: LicenseFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<LicenseFormValue>(initialValue ?? emptyValue)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const authority = form.authority.trim()
  const licenseNumber = form.licenseNumber.trim()
  //const specialty = form.specialty?.trim()
  const profession = form.profession.trim()
  const issueDate = form.issueDate?.trim() || null
  const expiryDate = form.expiryDate?.trim() || null

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

  const formInvalid =
    !authority ||
    !licenseNumber ||
    !profession ||
    Boolean(issueDate && expiryDate && expiryDate < issueDate)

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      const clientId = generateId ? (form.id ?? createClientId()) : null

      await onSubmit({
        //...form,
        ...(!generateId && form.id ? { id: form.id } : {}),
        ...(generateId && clientId ? { clientId } : {}),
        authority,
        licenseNumber,
        profession,
        issueDate,
        expiryDate,
        specialty: form.specialty || null,
        //status: form.status,
        documentFile: allowDocumentUpload ? selectedDocument : null,
        isPrimary: form.isPrimary ?? false,
      })

      onOpenChange(false)
    } catch {
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

        {allowDocumentUpload && (
          <section className='rounded-2xl border bg-card p-5 shadow-sm'>
            {canAccessCurrentDocument &&
              employeeId &&
              initialValue?.id &&
              currentDocument && (
                <div className='mb-5'>
                  <div className='mb-3'>
                    <h3 className='text-sm font-semibold text-foreground'>
                      {t('boardDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {t('boardDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={licenseDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? t('boardDocument.replaceTitle')
                    : t('boardDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? t('boardDocument.replaceDescription')
                    : t('boardDocument.description')}
                </p>
              </div>

              <CredentialDocumentDropzone
                value={selectedDocument}
                onChange={setSelectedDocument}
                disabled={isSubmitting}
              />
            </div>
          </section>
        )}
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
  allowDocumentUpload = true,
  employeeId,
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
          allowDocumentUpload={allowDocumentUpload}
          employeeId={employeeId}
        />
      )}
    </FormDialog>
  )
}
