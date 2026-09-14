'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { ChevronDown, ChevronUp, Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { CredentialDocumentMetadata } from '@/modules/hr/credentials/types/credential-document.types'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { malpracticeDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { cn } from '@/lib/utils'
import { CredentialDocumentDropzone } from '../forms/credential-document-dropzone'
import { DatePicker } from './date-picker'
import { SaudiRiyalSymbol } from '../icons/saudi-riyal-symbol'

export type MalpracticeFormValue = {
  id?: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
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

export type MalpracticeFormSubmitValue = {
  id?: string
  clientId?: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate: string
  documentFile: File | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: MalpracticeFormValue | null
  onSubmit: (value: MalpracticeFormSubmitValue) => void | Promise<void>
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

const emptyValue: MalpracticeFormValue = {
  insuranceCompany: '',
  policyNumber: '',
  coverageAmount: null,
  startDate: null,
  expiryDate: null,
  //documentFileId: null,
  //isVerified: false,
}

function MalpracticeDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  initialValue?: MalpracticeFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: MalpracticeFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const [form, setForm] = useState<MalpracticeFormValue>(
    initialValue ?? emptyValue,
  )
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const insuranceCompany = form.insuranceCompany.trim()
  const policyNumber = form.policyNumber.trim()
  const coverageAmount =
    form.coverageAmount === '' ||
    form.coverageAmount === null ||
    form.coverageAmount === undefined
      ? null
      : form.coverageAmount
  const startDate = form.startDate || null
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

  const formInvalid =
    !insuranceCompany ||
    !policyNumber ||
    !expiryDate ||
    Boolean(startDate && expiryDate && expiryDate < startDate)

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
        insuranceCompany,
        policyNumber,
        coverageAmount,
        startDate: form.startDate || null,
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
  function stepCoverageAmount(direction: 1 | -1) {
    const current = Number(form.coverageAmount ?? 0)
    const next = Math.max(0, current + direction)

    update('coverageAmount', String(next))
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('malpracticeDocument.detailsTitle')}
            </h3>

            <p className='text-xs text-muted-foreground'>
              {crt('malpracticeDocument.detailsDescription')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>
                {crt('malpracticeDocument.insuranceCompany')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                className='h-11'
                value={form.insuranceCompany}
                onChange={(e) => update('insuranceCompany', e.target.value)}
                placeholder={crt(
                  'malpracticeDocument.insuranceCompanyPlaceholder',
                )}
              />
            </div>

            <div className='space-y-2'>
              <Label>
                {crt('malpracticeDocument.policyNumber')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                className='h-11'
                value={form.policyNumber}
                onChange={(e) => update('policyNumber', e.target.value)}
                placeholder={crt('malpracticeDocument.policyNumberPlaceholder')}
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label htmlFor='coverage-amount'>
                {crt('malpracticeDocument.coverageAmount')}
              </Label>

              <div className='relative' dir='ltr'>
                <span className='pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-muted-foreground'>
                  <SaudiRiyalSymbol
                    showAccessibleText={false}
                    className='text-base'
                  />
                </span>

                <Input
                  id='coverage-amount'
                  data-money-input='true'
                  type='number'
                  min='0'
                  step='0.01'
                  inputMode='decimal'
                  dir='ltr'
                  className='h-11 ps-9 pe-12 text-left'
                  value={form.coverageAmount ?? ''}
                  onChange={(e) => {
                    const val = e.target.value

                    if (val !== '' && Number(val) < 0) return

                    update('coverageAmount', val || null)
                  }}
                />

                <div className='absolute right-2 top-1/2 flex h-7 w-6 -translate-y-1/2 flex-col overflow-hidden rounded-md'>
                  <button
                    type='button'
                    aria-label={crt('increaseAmount')}
                    onClick={() => stepCoverageAmount(1)}
                    className='flex flex-1 items-center justify-center rounded-t-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                  >
                    <ChevronUp className='size-3.5' />
                  </button>

                  <div className='mx-1 border-t border-border/40' />

                  <button
                    type='button'
                    aria-label={crt('decreaseAmount')}
                    onClick={() => stepCoverageAmount(-1)}
                    className='flex flex-1 items-center justify-center rounded-b-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                  >
                    <ChevronDown className='size-3.5' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('malpracticeDocument.validityTitle')}
            </h3>

            <p className='text-xs text-muted-foreground'>
              {crt('malpracticeDocument.validityDescription')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <label
                htmlFor='startDate'
                className='block text-xs text-muted-foreground'
              >
                {crt('malpracticeDocument.startDate')}
              </label>

              <DatePicker
                id='startDate'
                value={form.startDate ?? null}
                onChange={(value) => update('startDate', value)}
              />
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='expiryDate'
                className='block text-xs text-muted-foreground'
              >
                {crt('malpracticeDocument.expiryDate')}
              </label>

              <DatePicker
                id='expiryDate'
                value={form.expiryDate ?? null}
                onChange={(value) => update('expiryDate', value ?? null)}
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
                      {crt('malpracticeDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {crt('malpracticeDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={malpracticeDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? crt('malpracticeDocument.replaceTitle')
                    : crt('malpracticeDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? crt('malpracticeDocument.replaceDescription')
                    : crt('malpracticeDocument.description')}
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
  allowDocumentUpload = true,
  employeeId,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-malpractice' : 'closed')
  const t = useTranslations('credentials')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? t('editMalpractice') : t('addMalpractice')}
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
          allowDocumentUpload={allowDocumentUpload}
          employeeId={employeeId}
        />
      )}
    </FormDialog>
  )
}
