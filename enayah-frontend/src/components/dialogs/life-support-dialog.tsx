'use client'

import { useState } from 'react'
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
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'
import { CredentialDocumentMetadata } from '@/modules/hr/credentials/types/credential-document.types'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { lifeSupportDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { CredentialDocumentDropzone } from '../forms/credential-document-dropzone'

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
  expiryDate: string | null
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

export type LifeSupportFormSubmitValue = {
  id?: string
  clientId?: string
  type: LifeSupportType
  provider: string
  certificateNumber?: string | null
  issueDate?: string | null
  expiryDate: string
  documentFile: File | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: LifeSupportFormValue | null
  onSubmit: (value: LifeSupportFormSubmitValue) => void | Promise<void>
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

const emptyValue: LifeSupportFormValue = {
  type: 'bls',
  provider: '',
  certificateNumber: null,
  issueDate: null,
  expiryDate: null,
  isVerified: false,
  document: null,
}

function LifeSupportDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  initialValue?: LifeSupportFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: LifeSupportFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const providerOptions = useProviderOptions()

  const [form, setForm] = useState<LifeSupportFormValue>(
    initialValue ?? emptyValue,
  )
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const type = form.type
  const provider = form.provider.trim()
  const expiryDate = form.expiryDate?.trim()
  const certificateNumber = form.certificateNumber?.trim() || null
  const issueDate = form.issueDate?.trim() || null

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

  const formInvalid =
    !type ||
    !provider ||
    !expiryDate ||
    Boolean(issueDate && expiryDate < issueDate)

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      const clientId = generateId ? (form.id ?? createClientId()) : null

      await onSubmit({
        ...(!generateId && form.id ? { id: form.id } : {}),
        ...(generateId && clientId ? { clientId } : {}),
        type,
        certificateNumber,
        provider,
        issueDate: form.issueDate || null,
        expiryDate,
        documentFile: allowDocumentUpload ? selectedDocument : null,
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
      <div className='space-y-6 px-6 py-1'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              Certification Details
            </h3>
            <p className='text-xs text-muted-foreground'>
              Enter the life support type, provider, and certificate number.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Type *</Label>
              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={form.type}
                onValueChange={(v) => update('type', v as LifeSupportType)}
              >
                <SelectTrigger className='h-11'>
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
              <ProviderCombobox
                value={form.provider}
                options={providerOptions}
                onChange={(provider) => update('provider', provider)}
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>Certificate Number</Label>
              <Input
                className='h-11'
                value={form.certificateNumber ?? ''}
                onChange={(e) =>
                  update('certificateNumber', e.target.value || null)
                }
                placeholder='CERT-123456'
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
                      {crt('lifeSupportDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {crt('lifeSupportDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={lifeSupportDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? crt('lifeSupportDocument.replaceTitle')
                    : crt('lifeSupportDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? crt('lifeSupportDocument.replaceDescription')
                    : crt('lifeSupportDocument.description')}
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
              Add the certificate issue and expiry dates.
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
        label={crt('save', {
          item: isRtl ? 'دعم الحياة' : 'Life Support',
        })}
        savingLabel={crt('saving', { item: 'life support' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
    </>
  )
}

export function LifeSupportDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
  allowDocumentUpload = true,
  employeeId,
}: Props) {
  const crt = useTranslations('credentials')

  const dialogKey = initialValue?.id ?? (open ? 'add-life-support' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? crt('editLifeSupport') : crt('addLifeSupport')}
      description="Enter the employee's life support certification details."
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
    >
      {open && (
        <LifeSupportDialogContent
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
