// enayah-frontend/src/components/dialogs/degree-verification-dialog.tsx

'use client'

import axios from 'axios'
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileText,
  History,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  UploadCloud,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type {
  CredentialVerificationEventSummary,
  CredentialVerificationMetadata,
} from '@/modules/hr/credentials/types/credential-verification.types'

import type { CredentialDocumentMetadata } from '@/modules/hr/credentials/types/credential-document.types'
import { degreeTypeColors } from '@/modules/hr/employees/components/profile/tabs/cards/credential-degrees'

const MAX_EVIDENCE_SIZE = 2 * 1024 * 1024

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const ALLOWED_EVIDENCE_EXTENSION = /\.(pdf|jpe?g|png|webp)$/i

type VerificationAction = 'verify' | 'revoke'

export type CredentialVerificationDialogItem = {
  id: string

  /*
   * Primary credential identity shown in the dialog header.
   *
   * Degree    → degreeName
   * Board     → boardName
   * Fellowship→ fellowshipName
   * Membership→ organization
   * License   → profession / license number
   * etc.
   */
  title: string

  /*
   * Secondary contextual information.
   *
   * Degree → institution
   * Board  → issuingBody
   * License→ authority
   */
  subtitle?: string | null

  /*
   * Optional badge/context.
   *
   * Degree → Bachelor
   * Board  → specialty
   * License→ specialty/status
   */
  descriptor?: string | null
  isVerified?: boolean | null
  document: CredentialDocumentMetadata | null
  verification?: CredentialVerificationMetadata | null
}

export type CredentialVerificationSubmitValue = {
  isVerified: boolean
  remarks: string | null
  evidenceFile?: File
}

interface Props {
  open: boolean
  credential: CredentialVerificationDialogItem | null
  isSubmitting?: boolean
  history?: CredentialVerificationEventSummary[]
  isHistoryLoading?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: CredentialVerificationSubmitValue) => Promise<void>
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function isAllowedEvidenceFile(file: File): boolean {
  return (
    ALLOWED_EVIDENCE_MIME_TYPES.has(file.type) ||
    ALLOWED_EVIDENCE_EXTENSION.test(file.name)
  )
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string
        }
      | undefined

    return responseData?.message ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function CredentialVerificationDialog({
  open,
  credential,
  isSubmitting = false,
  history,
  isHistoryLoading = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const t = useTranslations('credentials.verificationDialog')
  const ct = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [action, setAction] = useState<VerificationAction>('verify')
  const [remarks, setRemarks] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const currentVerification = credential?.verification ?? null
  const isCurrentlyVerified =
    currentVerification?.isVerified ?? credential?.isVerified ?? false
  const hasOriginalDocument = Boolean(credential?.document)
  const latestEvent = currentVerification?.latestEvent ?? null
  const historyEvents = useMemo(() => {
    if (history) {
      return history
    }

    return latestEvent ? [latestEvent] : []
  }, [history, latestEvent])

  function handleActionChange(nextAction: VerificationAction): void {
    setAction(nextAction)
    setValidationError(null)
    setSubmitError(null)

    if (nextAction === 'revoke') {
      setEvidenceFile(null)
    }
  }

  function selectEvidenceFile(file: File): void {
    setValidationError(null)
    setSubmitError(null)

    if (!isAllowedEvidenceFile(file)) {
      setValidationError(t('unsupportedFile'))

      return
    }

    if (file.size > MAX_EVIDENCE_SIZE) {
      setValidationError(t('fileTooLarge'))

      return
    }

    setEvidenceFile(file)
  }

  function handleFileInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0]

    /*
     * Reset input so the same file may be
     * selected again after removal.
     */
    event.target.value = ''

    if (!file) {
      return
    }

    selectEvidenceFile(file)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault()

    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (!file) {
      return
    }

    selectEvidenceFile(file)
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()

    if (!credential || isSubmitting) {
      return
    }

    setValidationError(null)
    setSubmitError(null)

    if (action === 'verify' && !hasOriginalDocument) {
      setValidationError(t('originalDocumentRequired'))

      return
    }

    const normalizedRemarks = remarks.trim()

    if (action === 'revoke' && !normalizedRemarks) {
      setValidationError(t('revocationReasonRequired'))

      return
    }

    try {
      await onSubmit({
        isVerified: action === 'verify',

        remarks: normalizedRemarks || null,

        ...(action === 'verify' && evidenceFile
          ? {
              evidenceFile,
            }
          : {}),
      })
    } catch (error) {
      setSubmitError(getRequestErrorMessage(error, t('requestFailed')))
    }
  }

  function formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat(isRtl ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const isRevocation = action === 'revoke'

  const submitDisabled =
    isSubmitting ||
    !credential ||
    (action === 'verify' && !hasOriginalDocument) ||
    (action === 'revoke' && !isCurrentlyVerified)

  const remarksId = useId()

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) {
          return
        }

        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        dir={isRtl ? 'rtl' : 'ltr'}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:max-w-3xl sm:rounded-3xl'
      >
        <form
          onSubmit={handleSubmit}
          className='flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col'
        >
          {/* Header */}
          <div className='shrink-0 border-b bg-gradient-to-br from-primary/10 via-background to-muted/30 px-6 py-5 sm:px-7'>
            <DialogHeader className='space-y-3 text-start'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex min-w-0 items-start gap-3'>
                  <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm'>
                    <ShieldCheck className='size-5 text-primary' />
                  </div>

                  <div className='min-w-0'>
                    <DialogTitle className='text-xl font-semibold tracking-tight'>
                      {t('title')}
                    </DialogTitle>

                    <DialogDescription className='mt-1'>
                      {t('description')}
                    </DialogDescription>
                  </div>
                </div>

                <Badge
                  variant='outline'
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 font-medium',

                    isCurrentlyVerified
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  )}
                >
                  {isCurrentlyVerified ? (
                    <BadgeCheck className='me-1.5 size-3.5' />
                  ) : (
                    <AlertTriangle className='me-1.5 size-3.5' />
                  )}

                  {isCurrentlyVerified ? t('verified') : t('notVerified')}
                </Badge>
              </div>

              {credential && (
                <div className='rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur'>
                  <div className='flex items-start gap-3'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                      <FileCheck2 className='size-5 text-primary' />
                    </div>

                    <div className='min-w-0'>
                      <p className='break-words font-semibold text-foreground'>
                        {credential.title}
                      </p>

                      {credential.subtitle && (
                        <p className='mt-0.5 break-words text-sm text-muted-foreground'>
                          {credential.subtitle}
                        </p>
                      )}

                      {/* {credential.descriptor && (
                        <Badge
                          variant='secondary'
                          className='mt-2 rounded-full'
                        >
                          {credential.descriptor}
                        </Badge>
                      )} */}
                      {credential.descriptor &&
                        (() => {
                          const degreeTypeClass =
                            degreeTypeColors[credential.descriptor] ??
                            degreeTypeColors.other

                          return (
                            <Badge
                              variant='outline'
                              className={cn(
                                'justify-center whitespace-nowrap rounded-full',
                                'px-2.5 py-1 text-xs font-semibold',
                                'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                                degreeTypeClass,
                              )}
                            >
                              {ct.has(credential.descriptor)
                                ? ct(credential.descriptor)
                                : credential.descriptor
                                    .replaceAll('_', ' ')
                                    .replace(/\b\w/g, (character) =>
                                      character.toUpperCase(),
                                    )}
                            </Badge>
                          )
                        })()}
                    </div>
                  </div>
                </div>
              )}
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <div className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-7'>
            {/* Current verification */}
            <section className='space-y-3'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='size-4 text-primary' />

                <h3 className='font-semibold'>{t('currentVerification')}</h3>
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                <VerificationDetail
                  icon={<BadgeCheck className='size-4' />}
                  label={t('status')}
                  value={isCurrentlyVerified ? t('verified') : t('notVerified')}
                />

                <VerificationDetail
                  icon={<UserRoundCheck className='size-4' />}
                  label={t('verifiedBy')}
                  value={currentVerification?.verifiedBy?.displayName ?? '—'}
                />

                <VerificationDetail
                  icon={<CalendarClock className='size-4' />}
                  label={t('verifiedAt')}
                  value={formatDateTime(currentVerification?.verifiedAt)}
                />
              </div>

              {currentVerification?.remarks && (
                <div className='rounded-2xl border bg-muted/25 p-4'>
                  <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    {t('currentRemarks')}
                  </p>

                  <p className='mt-2 whitespace-pre-wrap text-sm leading-6'>
                    {currentVerification.remarks}
                  </p>
                </div>
              )}
            </section>

            <Separator />

            {/* Original document */}
            <section className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <FileText className='size-4 text-primary' />

                  <h3 className='font-semibold'>{t('originalDocument')}</h3>
                </div>

                {hasOriginalDocument && (
                  <Badge
                    variant='outline'
                    className='rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  >
                    {t('documentAvailable')}
                  </Badge>
                )}
              </div>

              {credential?.document ? (
                <DocumentMetadataCard document={credential.document} />
              ) : (
                <div className='flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4'>
                  <AlertTriangle className='mt-0.5 size-5 shrink-0 text-amber-600' />

                  <div>
                    <p className='font-medium text-amber-800 dark:text-amber-300'>
                      {t('noOriginalDocument')}
                    </p>

                    <p className='mt-1 text-sm leading-5 text-amber-700/90 dark:text-amber-300/80'>
                      {t('originalDocumentRequired')}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* Verification action */}
            <section className='space-y-3'>
              <div>
                <h3 className='font-semibold'>{t('chooseAction')}</h3>

                <p className='mt-1 text-sm text-muted-foreground'>
                  {t('chooseActionDescription')}
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <button
                  type='button'
                  disabled={isSubmitting || !hasOriginalDocument}
                  onClick={() => handleActionChange('verify')}
                  className={cn(
                    'group rounded-2xl border p-4 text-start transition-all',
                    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
                    'disabled:pointer-events-none disabled:opacity-50',

                    action === 'verify'
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'bg-background',
                  )}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        action === 'verify'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      {isCurrentlyVerified ? (
                        <RotateCcw className='size-5' />
                      ) : (
                        <ShieldCheck className='size-5' />
                      )}
                    </div>

                    <div>
                      <p className='font-semibold'>
                        {isCurrentlyVerified ? t('reverify') : t('verify')}
                      </p>

                      <p className='mt-1 text-sm leading-5 text-muted-foreground'>
                        {isCurrentlyVerified
                          ? t('reverifyDescription')
                          : t('verifyDescription')}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type='button'
                  disabled={isSubmitting || !isCurrentlyVerified}
                  onClick={() => handleActionChange('revoke')}
                  className={cn(
                    'group rounded-2xl border p-4 text-start transition-all',
                    'hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-md',
                    'disabled:pointer-events-none disabled:opacity-50',

                    action === 'revoke'
                      ? 'border-destructive bg-destructive/5 shadow-sm ring-1 ring-destructive/20'
                      : 'bg-background',
                  )}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        action === 'revoke'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      <ShieldX className='size-5' />
                    </div>

                    <div>
                      <p className='font-semibold'>{t('revoke')}</p>

                      <p className='mt-1 text-sm leading-5 text-muted-foreground'>
                        {t('revokeDescription')}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Evidence */}
            {action === 'verify' && (
              <>
                <Separator />

                <section className='space-y-3'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <UploadCloud className='size-4 text-primary' />

                      <h3 className='font-semibold'>
                        {t('verificationEvidence')}
                      </h3>

                      <Badge variant='secondary' className='rounded-full'>
                        {t('optional')}
                      </Badge>
                    </div>

                    <p className='mt-1 text-sm text-muted-foreground'>
                      {t('evidenceDescription')}
                    </p>
                  </div>

                  {!evidenceFile ? (
                    <div
                      role='button'
                      tabIndex={0}
                      aria-disabled={isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()

                          fileInputRef.current?.click()
                        }
                      }}
                      onDragEnter={(event) => {
                        event.preventDefault()

                        setIsDragging(true)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()

                        setIsDragging(true)
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault()

                        setIsDragging(false)
                      }}
                      onDrop={handleDrop}
                      className={cn(
                        'cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',

                        isDragging
                          ? 'border-primary bg-primary/10 shadow-inner'
                          : 'border-muted-foreground/25 bg-muted/20 hover:border-primary/40 hover:bg-primary/5',

                        isSubmitting && 'pointer-events-none opacity-60',
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type='file'
                        className='hidden'
                        accept='.pdf,.jpg,.jpeg,.png,.webp'
                        onChange={handleFileInputChange}
                      />

                      <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
                        <UploadCloud className='size-6 text-primary' />
                      </div>

                      <p className='mt-3 font-medium'>{t('dropEvidence')}</p>

                      <p className='mt-1 text-sm text-muted-foreground'>
                        {t('browseEvidence')}
                      </p>

                      <p className='mt-3 text-xs text-muted-foreground'>
                        {t('allowedEvidence')}
                      </p>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 rounded-2xl border bg-muted/20 p-4'>
                      <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                        <FileText className='size-5 text-primary' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <p className='truncate font-medium'>
                          {evidenceFile.name}
                        </p>

                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {formatFileSize(evidenceFile.size)}
                        </p>
                      </div>

                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        disabled={isSubmitting}
                        aria-label={t('removeEvidence')}
                        onClick={() => {
                          setEvidenceFile(null)

                          setValidationError(null)
                        }}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>
                  )}

                  {currentVerification?.evidenceDocument && (
                    <div className='rounded-2xl border bg-background p-4'>
                      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        {t('currentEvidence')}
                      </p>

                      <div className='mt-3'>
                        <DocumentMetadataCard
                          document={currentVerification.evidenceDocument}
                        />
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            <Separator />

            {/* Remarks */}
            <section className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <Label
                  //htmlFor='credential-verification-remarks'
                  htmlFor={remarksId}
                  className='font-semibold'
                >
                  {isRevocation
                    ? t('revocationReason')
                    : t('verificationRemarks')}
                </Label>

                <Badge variant='secondary' className='rounded-full'>
                  {isRevocation ? t('required') : t('optional')}
                </Badge>
              </div>

              <Textarea
                //id='credential-verification-remarks'
                id={remarksId}
                value={remarks}
                disabled={isSubmitting}
                maxLength={1000}
                rows={4}
                placeholder={
                  isRevocation
                    ? t('revocationPlaceholder')
                    : t('remarksPlaceholder')
                }
                className='min-h-28 resize-y rounded-2xl'
                onChange={(event) => {
                  setRemarks(event.target.value)

                  setValidationError(null)

                  setSubmitError(null)
                }}
              />

              <div className='flex justify-end text-xs text-muted-foreground'>
                {remarks.length}
                /1000
              </div>
            </section>

            {(validationError || submitError) && (
              <div className='flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive'>
                <AlertTriangle className='mt-0.5 size-5 shrink-0' />

                <p className='text-sm font-medium'>
                  {validationError ?? submitError}
                </p>
              </div>
            )}

            <Separator />

            {/* History */}
            <section className='space-y-4'>
              <div className='flex items-center gap-2'>
                <History className='size-4 text-primary' />

                <h3 className='font-semibold'>{t('verificationHistory')}</h3>
              </div>

              {isHistoryLoading ? (
                <div className='flex items-center justify-center rounded-2xl border p-8 text-muted-foreground'>
                  <Loader2 className='me-2 size-4 animate-spin' />

                  {t('loadingHistory')}
                </div>
              ) : historyEvents.length > 0 ? (
                <div className='space-y-0'>
                  {historyEvents.map((event, index) => (
                    <VerificationHistoryItem
                      key={event.id}
                      event={event}
                      isLast={index === historyEvents.length - 1}
                      formatDateTime={formatDateTime}
                      verifiedLabel={t('verified')}
                      revokedLabel={t('revoked')}
                      remarksLabel={t('remarks')}
                      evidenceLabel={t('supportingEvidence')}
                    />
                  ))}
                </div>
              ) : (
                <div className='rounded-2xl border border-dashed bg-muted/15 p-7 text-center'>
                  <History className='mx-auto size-7 text-muted-foreground' />

                  <p className='mt-3 font-medium'>{t('noHistory')}</p>

                  <p className='mt-1 text-sm text-muted-foreground'>
                    {t('noHistoryDescription')}
                  </p>
                </div>
              )}
            </section>
          </div>

          <DialogFooter className='shrink-0 border-t bg-muted/20 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-6'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>

            <Button
              type='submit'
              variant={isRevocation ? 'destructive' : 'default'}
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <Loader2 className='me-2 size-4 animate-spin' />
              ) : isRevocation ? (
                <ShieldX className='me-2 size-4' />
              ) : (
                <ShieldCheck className='me-2 size-4' />
              )}

              {isSubmitting
                ? t('saving')
                : isRevocation
                  ? t('revokeVerification')
                  : isCurrentlyVerified
                    ? t('updateVerification')
                    : t('verifyCredential')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VerificationDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='rounded-2xl border bg-muted/15 p-4'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        {icon}

        <span className='text-xs font-medium'>{label}</span>
      </div>

      <p className='mt-2 break-words text-sm font-semibold'>{value}</p>
    </div>
  )
}

function DocumentMetadataCard({
  document,
}: {
  document: CredentialDocumentMetadata
}) {
  return (
    <div className='flex items-center gap-3 rounded-2xl border bg-background p-4 shadow-sm'>
      <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
        <FileText className='size-5 text-primary' />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{document.originalName}</p>

        <p className='mt-0.5 text-xs text-muted-foreground'>
          {document.mimeType}
          {' · '}
          {formatFileSize(document.fileSize)}
        </p>
      </div>
    </div>
  )
}

function VerificationHistoryItem({
  event,
  isLast,
  formatDateTime,
  verifiedLabel,
  revokedLabel,
  remarksLabel,
  evidenceLabel,
}: {
  event: CredentialVerificationEventSummary

  isLast: boolean

  formatDateTime: (value: string | null | undefined) => string

  verifiedLabel: string
  revokedLabel: string
  remarksLabel: string
  evidenceLabel: string
}) {
  const isVerifiedEvent = event.action === 'verified'

  return (
    <div className='relative flex gap-4'>
      {!isLast && (
        <div className='absolute inset-y-8 start-[19px] w-px bg-border' />
      )}

      <div
        className={cn(
          'relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm',

          isVerifiedEvent
            ? 'border-emerald-500/30 text-emerald-600'
            : 'border-destructive/30 text-destructive',
        )}
      >
        {isVerifiedEvent ? (
          <ShieldCheck className='size-4' />
        ) : (
          <ShieldX className='size-4' />
        )}
      </div>

      <div
        className={cn(
          'min-w-0 flex-1 rounded-2xl border bg-muted/15 p-4',

          !isLast && 'mb-4',
        )}
      >
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <Badge
              variant='outline'
              className={cn(
                'rounded-full',

                isVerifiedEvent
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-destructive/30 bg-destructive/10 text-destructive',
              )}
            >
              {isVerifiedEvent ? verifiedLabel : revokedLabel}
            </Badge>

            <p className='mt-2 text-sm font-medium'>
              {event.performedBy.displayName}
            </p>
          </div>

          <time className='text-xs text-muted-foreground'>
            {formatDateTime(event.performedAt)}
          </time>
        </div>

        {event.remarks && (
          <div className='mt-3 rounded-xl bg-background p-3'>
            <p className='text-xs font-medium text-muted-foreground'>
              {remarksLabel}
            </p>

            <p className='mt-1 whitespace-pre-wrap text-sm leading-5'>
              {event.remarks}
            </p>
          </div>
        )}

        {event.evidenceDocument && (
          <div className='mt-3'>
            <p className='mb-2 text-xs font-medium text-muted-foreground'>
              {evidenceLabel}
            </p>

            <DocumentMetadataCard document={event.evidenceDocument} />
          </div>
        )}
      </div>
    </div>
  )
}
