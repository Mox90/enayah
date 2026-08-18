'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { useLocale, useTranslations } from 'next-intl'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'
import { CredentialDocumentMetadata } from '@/modules/hr/credentials/types/credential-document.types'
import { cn } from '@/lib/utils'
import { membershipDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { CredentialDocumentDropzone } from '../forms/credential-document-dropzone'
import { DatePicker } from './date-picker'

export type MembershipFormValue = {
  id?: string
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null

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

export type MembershipFormSubmitValue = {
  id?: string
  clientId?: string
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null
  documentFile: File | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: MembershipFormValue | null
  onSubmit: (value: MembershipFormSubmitValue) => void | Promise<void>
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

const emptyValue: MembershipFormValue = {
  organization: '',
  membershipNumber: null,
  membershipLevel: null,
  startDate: null,
  expiryDate: null,
  isVerified: false,
  document: null,
}

function MembershipDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  initialValue?: MembershipFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: MembershipFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const [form, setForm] = useState<MembershipFormValue>(
    initialValue ?? emptyValue,
  )
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const organization = form.organization.trim()
  const membershipNumber = form.membershipNumber?.trim() || null
  const startDate = form.startDate?.trim() || null
  const expiryDate = form.expiryDate?.trim() || null

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

  const formInvalid =
    !organization || Boolean(startDate && expiryDate && expiryDate < startDate)

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
        ...(!generateId && form.id ? { id: form.id } : {}),
        ...(generateId && clientId ? { clientId } : {}),
        organization,
        membershipNumber,
        membershipLevel: form.membershipLevel || null,
        startDate,
        expiryDate,
        documentFile: allowDocumentUpload ? selectedDocument : null,
      })

      onOpenChange(false)
    } catch (error) {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
      console.log(error)
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

        {allowDocumentUpload && (
          <section className='rounded-2xl border bg-card p-5 shadow-sm'>
            {canAccessCurrentDocument &&
              employeeId &&
              initialValue?.id &&
              currentDocument && (
                <div className='mb-5'>
                  <div className='mb-3'>
                    <h3 className='text-sm font-semibold text-foreground'>
                      {t('membershipDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {t('membershipDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={membershipDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? t('membershipDocument.replaceTitle')
                    : t('membershipDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? t('membershipDocument.replaceDescription')
                    : t('membershipDocument.description')}
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
              {/* <Label>Start Date</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.startDate ?? ''}
                onChange={(e) => update('startDate', e.target.value || null)}
              /> */}
              <label
                htmlFor={'startDate'}
                className='text-xs text-muted-foreground block'
              >
                {'Start Date'}
              </label>

              <DatePicker
                id='startDate'
                value={form.startDate}
                onChange={(value) => update('startDate', value)}
              />
            </div>

            <div className='space-y-2'>
              {/* <Label>Expiry Date</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value || null)}
              /> */}
              <label
                htmlFor={'expiryDate'}
                className='text-xs text-muted-foreground block'
              >
                {'Expiry Date'}
              </label>

              <DatePicker
                id='expiryDate'
                value={form.expiryDate}
                onChange={(value) => update('expiryDate', value)}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={t('save', {
          item: isRtl ? 'عضوية' : 'Membership',
        })}
        savingLabel={t('saving', { item: 'membership' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
    </>
  )
}

export function MembershipDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
  allowDocumentUpload = true,
  employeeId,
}: Props) {
  const crt = useTranslations('credentials')

  const dialogKey = initialValue?.id ?? (open ? 'add-membership' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? crt('editMembership') : crt('addMembership')}
      description="Enter the employee's professional membership details."
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
    >
      {open && (
        <MembershipDialogContent
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
