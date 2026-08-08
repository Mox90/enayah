// enayah-frontend/src/copoents/dialogs/degree-dialog.tsx

'use client'

import { useState } from 'react'

import { Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { CredentialDocumentDropzone } from '@/components/forms/credential-document-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Footer } from '../footer/footer'
import { FormDialog } from '../forms'
import { CredentialDocumentMetadata } from '@/modules/hr/onboarding/types/onboarding.types'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { cn } from '@/lib/utils'
import { degreeDocumentService } from '@/modules/hr/credentials/services/credential-document.service'

export type DegreeFormValue = {
  id?: string

  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'

  degreeName: string
  major?: string | null
  institution: string
  graduationDate?: string | null

  /*
   * Read-only data that may be present when editing.
   * This field is not sent back to the backend.
   */
  isVerified?: boolean | null

  /*
   * Existing document metadata when editing.
   * This is not submitted to the backend.
   */
  document?: CredentialDocumentMetadata | null
}

export type DegreeFormSubmitValue = {
  id?: string

  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'

  degreeName: string
  major: string | null
  institution: string
  graduationDate: string | null
  documentFile: File | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: DegreeFormValue | null
  onSubmit: (value: DegreeFormSubmitValue) => void | Promise<void>
  generateId?: boolean

  /*
   * Existing employee profile:
   * true — document can be uploaded immediately.
   *
   * Employee onboarding:
   * false — employeeId does not exist yet.
   */
  allowDocumentUpload?: boolean
  employeeId?: string
}

const emptyValue: DegreeFormValue = {
  degreeType: 'bachelor',
  degreeName: '',
  major: null,
  institution: '',
  graduationDate: null,
  isVerified: false,
}

function DegreeDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
  allowDocumentUpload,
  employeeId,
}: {
  /*
   * Required property with an explicit undefined union.
   * This avoids exactOptionalPropertyTypes errors when
   * DegreeDialog passes initialValue explicitly.
   */
  initialValue: DegreeFormValue | null | undefined
  onOpenChange: (open: boolean) => void
  onSubmit: (value: DegreeFormSubmitValue) => void | Promise<void>
  generateId: boolean
  allowDocumentUpload: boolean
  employeeId?: string | undefined
}) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<DegreeFormValue>(initialValue ?? emptyValue)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentDocument = initialValue?.document ?? null
  const canAccessCurrentDocument = Boolean(
    employeeId && initialValue?.id && currentDocument,
  )

  const degreeName = form.degreeName.trim()
  const institution = form.institution.trim()

  function update<K extends keyof DegreeFormValue>(
    field: K,
    value: DegreeFormValue[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function createClientId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `degree-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const formInvalid = !degreeName || !institution

  function closeDialog() {
    if (isSubmitting) {
      return
    }

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) {
      return
    }

    setIsSubmitting(true)

    try {
      const resolvedId = form.id ?? (generateId ? createClientId() : null)

      /*
       * Use a conditional spread rather than:
       *
       * id: resolvedId ?? undefined
       *
       * This is compatible with
       * exactOptionalPropertyTypes: true.
       */
      await onSubmit({
        ...(resolvedId ? { id: resolvedId } : {}),
        degreeType: form.degreeType,
        degreeName,
        major: form.major?.trim() || null,
        institution,
        graduationDate: form.graduationDate || null,
        documentFile: allowDocumentUpload ? selectedDocument : null,
      })

      onOpenChange(false)
    } catch {
      /*
       * Keep the dialog open.
       * The mutation hook displays the error toast.
       */
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
              {t('highestEducationalLabel')}
            </h3>

            <p className='text-xs text-muted-foreground'>
              {t.rich('dialogDes', {
                item: isRtl
                  ? 'المؤهلات التعليمية للموظف'
                  : "employee's educational qualification",
              })}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2 xl:col-span-2'>
              <Label>{t('degreeNameLabel')}</Label>

              <Input
                className='h-11'
                value={form.degreeName}
                onChange={(event) => update('degreeName', event.target.value)}
                placeholder={t('degreePlaceHolder')}
                disabled={isSubmitting}
              />
            </div>

            <div className='space-y-2'>
              <Label>{t('degreeTypeLabel')}</Label>

              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={form.degreeType}
                disabled={isSubmitting}
                onValueChange={(value) =>
                  update('degreeType', value as DegreeFormValue['degreeType'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='diploma'>{t('diploma')}</SelectItem>

                  <SelectItem value='associate'>{t('associate')}</SelectItem>

                  <SelectItem value='bachelor'>{t('bachelor')}</SelectItem>

                  <SelectItem value='master'>{t('master')}</SelectItem>

                  <SelectItem value='doctorate'>{t('doctorate')}</SelectItem>

                  <SelectItem value='other'>{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('major')}</Label>

              <Input
                className='h-11'
                value={form.major ?? ''}
                onChange={(event) =>
                  update('major', event.target.value || null)
                }
                placeholder={t('majorPlaceHolder')}
                disabled={isSubmitting}
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>{t('institutionNameLabel')}</Label>

              <Input
                className='h-11'
                value={form.institution}
                onChange={(event) => update('institution', event.target.value)}
                placeholder={t('institutionPlaceHolder')}
                disabled={isSubmitting}
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
                      {t('degreeDocument.currentTitle')}
                    </h3>

                    <p className='text-xs text-muted-foreground'>
                      {t('degreeDocument.currentDescription')}
                    </p>
                  </div>

                  <CredentialDocumentSummary
                    employeeId={employeeId}
                    credentialId={initialValue.id}
                    document={currentDocument}
                    service={degreeDocumentService}
                  />
                </div>
              )}

            <div className={cn(canAccessCurrentDocument && 'border-t pt-5')}>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {canAccessCurrentDocument
                    ? t('degreeDocument.replaceTitle')
                    : t('degreeDocument.title')}
                </h3>

                <p className='text-xs text-muted-foreground'>
                  {canAccessCurrentDocument
                    ? t('degreeDocument.replaceDescription')
                    : t('degreeDocument.description')}
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
              {t('graduationDateLabel')}
            </h3>

            <p className='text-xs text-muted-foreground'>{t('degreeSub')}</p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{t('graduationDateLabel')}</Label>

              <Input
                type='date'
                className='h-11 bg-background'
                value={form.graduationDate ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('graduationDate', event.target.value || null)
                }
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={t('save', {
          item: isRtl ? 'التحصيل العلمي' : 'Educational Attainment',
        })}
        savingLabel={t('saving', {
          item: isRtl ? 'التحصيل العلمي' : 'educational attainment',
        })}
        disabled={formInvalid || isSubmitting}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
    </>
  )
}

export function DegreeDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
  allowDocumentUpload = true,
  employeeId,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-degree' : 'closed')

  const t = useTranslations('credentials')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? t('editDegree') : t('addDegree')}
      description={t('educationSub')}
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
    >
      {open && (
        <DegreeDialogContent
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
