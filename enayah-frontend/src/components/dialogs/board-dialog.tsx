'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { FormDialog } from '@/components/forms'
import { Footer } from '@/components/footer/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CredentialDocumentMetadata } from '@/modules/hr/onboarding/types/onboarding.types'
import { CredentialDocumentDropzone } from '../forms/credential-document-dropzone'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { boardDocumentService } from '@/modules/hr/credentials/services/credential-document.service'

export type BoardFormValue = {
  id?: string
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean | null

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

export type BoardFormSubmitValue = {
  id?: string
  boardName: string
  specialty: string | null
  issuingBody: string
  issueDate: string | null
  expiryDate: string | null
  isLifetime: boolean
  documentFile: File | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: BoardFormValue | null
  onSubmit: (value: BoardFormSubmitValue) => void | Promise<void>
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

const emptyValue: BoardFormValue = {
  boardName: '',
  specialty: null,
  issuingBody: '',
  issueDate: null,
  expiryDate: null,
  isLifetime: false,
  isVerified: false,
  document: null,
}

function BoardDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  initialValue: BoardFormValue | null | undefined
  onOpenChange: (open: boolean) => void
  onSubmit: (value: BoardFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const [form, setForm] = useState<BoardFormValue>(initialValue ?? emptyValue)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const boardName = form.boardName.trim()
  const issuingBody = form.issuingBody.trim()
  const issueDate = form.issueDate?.trim() || null
  const expiryDate = form.expiryDate?.trim() || null
  const isLifetime = form.isLifetime ?? false

  function update<K extends keyof BoardFormValue>(
    field: K,
    value: BoardFormValue[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function createClientId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `board-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const formInvalid =
    !boardName ||
    !issuingBody ||
    Boolean(!isLifetime && issueDate && expiryDate && expiryDate < issueDate)

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitting || formInvalid) {
      return
    }

    setIsSubmitting(true)

    try {
      const resolvedId = form.id ?? (generateId ? createClientId() : null)

      await onSubmit({
        ...(resolvedId ? { id: resolvedId } : {}),
        boardName,
        specialty: form.specialty?.trim() || null,
        issuingBody,
        issueDate,
        expiryDate: isLifetime ? null : expiryDate,
        isLifetime,
        documentFile: allowDocumentUpload ? selectedDocument : null,
      })

      onOpenChange(false)
    } catch {
      /*
       * Keep the dialog open.
       * The mutation hook should display the error.
       */
    } finally {
      setIsSubmitting(false)
    }
  }

  // const submitDisabled =
  //   isSubmitting ||
  //   !form.boardName.trim() ||
  //   !form.issuingBody.trim() ||
  //   Boolean(
  //     form.issueDate && form.expiryDate && form.expiryDate < form.issueDate,
  //   )

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('boardSub2')}
            </h3>

            <p className='text-xs text-muted-foreground'>{crt('boardSub3')}</p>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='boardName'>
                {crt('boardName')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='boardName'
                className='h-11'
                value={form.boardName}
                disabled={isSubmitting}
                onChange={(event) => update('boardName', event.target.value)}
                placeholder='Saudi Board in General Surgery'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardSpecialty'>{crt('specialty')}</Label>

              <Input
                id='boardSpecialty'
                className='h-11'
                value={form.specialty ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('specialty', event.target.value || null)
                }
                placeholder='General Surgery'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardIssuingBody'>
                {crt('issuingBody')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='boardIssuingBody'
                className='h-11'
                value={form.issuingBody}
                disabled={isSubmitting}
                onChange={(event) => update('issuingBody', event.target.value)}
                placeholder='Saudi Commission for Health Specialties'
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
                      {crt('boardDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {crt('boardDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={boardDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? crt('boardDocument.replaceTitle')
                    : crt('boardDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? crt('boardDocument.replaceDescription')
                    : crt('boardDocument.description')}
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
              {crt('validityPeriodLbl')}
            </h3>

            <p className='text-xs text-muted-foreground'>
              {crt('validityPeriodSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='boardIssueDate'>{crt('issued')}</Label>

              <Input
                id='boardIssueDate'
                type='date'
                className='h-11 bg-background'
                value={form.issueDate ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('issueDate', event.target.value || null)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardExpiryDate'>{crt('expires')}</Label>

              {/* <Input
                id='boardExpiryDate'
                type='date'
                className='h-11 bg-background'
                min={issueDate ?? undefined}
                value={form.expiryDate ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('expiryDate', event.target.value || null)
                }
              /> */}
              <Input
                id='boardExpiryDate'
                type='date'
                className='h-11 bg-background'
                min={issueDate ?? undefined}
                value={isLifetime ? '' : (form.expiryDate ?? '')}
                disabled={isSubmitting || isLifetime}
                onChange={(event) =>
                  update('expiryDate', event.target.value || null)
                }
              />

              <div className='xl:col-span-2'>
                <label className='flex cursor-pointer items-center gap-3 rounded-xl border bg-background px-4 py-3'>
                  <input
                    type='checkbox'
                    checked={isLifetime}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      update('isLifetime', event.target.checked)

                      if (event.target.checked) {
                        update('expiryDate', null)
                      }
                    }}
                  />

                  <div>
                    <p className='text-sm font-medium'>
                      {crt('lifetimeCertification')}
                    </p>

                    <p className='text-xs text-muted-foreground'>
                      {crt('lifetimeCertificationDescription')}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={crt('save', {
          item: isRtl ? 'المجلس' : 'Board',
        })}
        savingLabel={crt('saving', { item: 'board' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
    </>
  )
}

export function BoardDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
  allowDocumentUpload = true,
  employeeId,
}: Props) {
  const crt = useTranslations('credentials')

  const dialogKey = initialValue?.id ?? (open ? 'add-board' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? crt('editBoard') : crt('addBoard')}
      description={crt('boardSub')}
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
    >
      {open && (
        <BoardDialogContent
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
