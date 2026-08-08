// enayah-frontend/src/modules/hr/credentials/components/degree-verification-summary.tsx

'use client'

import {
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  CredentialVerificationService,
  degreeVerificationService,
} from '../services/credential-verification.service'

import type { CredentialVerificationMetadata } from '../types/credential-verification.types'

type EvidenceAction = 'preview' | 'download' | null

interface Props {
  employeeId: string
  credentialId: string
  verification: CredentialVerificationMetadata
  service: CredentialVerificationService
  onManage?: () => void
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) {
    return `${fileSize} B`
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
}

function createTemporaryObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

function revokeTemporaryObjectUrl(objectUrl: string): void {
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 60_000)
}

export function CredentialVerificationSummary({
  employeeId,
  credentialId,
  verification,
  service,
  onManage,
}: Props) {
  const t = useTranslations('credentials.verificationSummary')

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [evidenceAction, setEvidenceAction] = useState<EvidenceAction>(null)

  const eventId = verification.latestEvent?.id ?? null

  const evidence = verification.evidenceDocument

  function formatDateTime(value: string | null): string {
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

  function scheduleEvidencePreviewUrlCleanup(
    objectUrl: string,
    previewWindow: Window,
  ): void {
    let cleanedUp = false

    const cleanUp = (): void => {
      if (cleanedUp) {
        return
      }

      cleanedUp = true

      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)

      URL.revokeObjectURL(objectUrl)
    }

    const intervalId = window.setInterval(() => {
      if (previewWindow.closed) {
        cleanUp()
      }
    }, 1_000)

    /*
     * Fallback cleanup when the browser does not reliably
     * report whether the preview tab was closed.
     */
    const timeoutId = window.setTimeout(cleanUp, 5 * 60 * 1_000)
  }

  async function handlePreviewEvidence(): Promise<void> {
    if (!eventId || !evidence || evidenceAction !== null) {
      return
    }

    /*
     * Open the tab synchronously during the click event.
     * Opening it after awaiting the API request may be treated
     * as an unsolicited popup.
     */
    const previewWindow = window.open('', '_blank')

    if (!previewWindow) {
      toast.error(t('previewBlocked'))
      return
    }

    previewWindow.opener = null
    setEvidenceAction('preview')

    try {
      const blob = await service.previewEvidence({
        employeeId,
        credentialId,
        eventId,
      })

      const objectUrl = URL.createObjectURL(blob)

      previewWindow.location.replace(objectUrl)

      scheduleEvidencePreviewUrlCleanup(objectUrl, previewWindow)
    } catch {
      previewWindow.close()
      toast.error(t('previewFailed'))
    } finally {
      setEvidenceAction(null)
    }
  }

  async function handleDownloadEvidence(): Promise<void> {
    if (!eventId || !evidence) {
      return
    }

    setEvidenceAction('download')

    try {
      const blob = await service.downloadEvidence({
        employeeId,
        credentialId,
        eventId,
      })

      const objectUrl = createTemporaryObjectUrl(blob)

      const anchor = document.createElement('a')

      anchor.href = objectUrl
      anchor.download = evidence.originalName

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      revokeTemporaryObjectUrl(objectUrl)
    } catch {
      toast.error(t('downloadFailed'))
    } finally {
      setEvidenceAction(null)
    }
  }

  return (
    <section className='mt-4'>
      <div
        className={cn(
          'overflow-hidden rounded-xl border',
          'border-emerald-500/20',
          'bg-gradient-to-br from-emerald-500/[0.07] via-background to-background',
          'shadow-[0_8px_24px_rgba(16,185,129,0.05)]',
        )}
      >
        {/* Compact heading */}
        <div className='flex items-center justify-between gap-3 px-3.5 py-3'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'>
              <ShieldCheck className='size-4' />
            </div>

            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold'>{t('title')}</p>

              <p className='truncate text-xs text-muted-foreground'>
                {t('description')}
              </p>
            </div>
          </div>

          <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400'>
            <BadgeCheck className='size-3.5' />
            {t('verified')}
          </span>
        </div>

        <div className='border-t border-emerald-500/15 px-3.5 py-3'>
          {/* Actor and time */}
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <UserRoundCheck className='size-3.5 shrink-0 text-muted-foreground' />

              <span className='text-muted-foreground'>{t('verifiedBy')}:</span>

              <span className='max-w-48 truncate font-medium text-foreground'>
                {verification.verifiedBy?.displayName ?? '—'}
              </span>
            </div>

            <div className='flex items-center gap-1.5'>
              <CalendarClock className='size-3.5 shrink-0 text-muted-foreground' />

              <span className='text-muted-foreground'>{t('verifiedAt')}:</span>

              <time className='font-medium text-foreground'>
                {formatDateTime(verification.verifiedAt)}
              </time>
            </div>
          </div>

          {/* Remarks preview */}
          {verification.remarks && (
            <div className='mt-3 rounded-lg bg-background/65 px-3 py-2.5'>
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <MessageSquareText className='size-3.5 shrink-0' />

                <span className='text-[11px] font-semibold uppercase tracking-wide'>
                  {t('remarks')}
                </span>
              </div>

              <p className='mt-1.5 line-clamp-2 whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground'>
                {verification.remarks}
              </p>
            </div>
          )}

          {/* Evidence and actions */}
          <div
            className={cn(
              'mt-3 flex items-center gap-2',
              evidence && eventId
                ? 'justify-between border-t pt-3'
                : 'justify-end',
            )}
          >
            {evidence && eventId && (
              <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <FileText className='size-4' />
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-xs font-semibold'>
                    {evidence.originalName}
                  </p>

                  <p className='text-[11px] text-muted-foreground'>
                    {formatFileSize(evidence.fileSize)}
                  </p>
                </div>
              </div>
            )}

            <div className='flex shrink-0 items-center gap-1'>
              {evidence && eventId && (
                <>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-8'
                    disabled={evidenceAction !== null}
                    aria-label={t('preview')}
                    onClick={() => {
                      void handlePreviewEvidence()
                    }}
                  >
                    {evidenceAction === 'preview' ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <Eye className='size-4' />
                    )}
                  </Button>

                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-8'
                    disabled={evidenceAction !== null}
                    aria-label={t('download')}
                    onClick={() => {
                      void handleDownloadEvidence()
                    }}
                  >
                    {evidenceAction === 'download' ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <Download className='size-4' />
                    )}
                  </Button>
                </>
              )}

              {onManage && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2.5 text-xs'
                  onClick={onManage}
                >
                  {t('manage')}
                  <ChevronRight
                    className={cn('ms-1.5 size-3.5', isRtl && 'rotate-180')}
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VerificationSummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='flex items-start gap-3 rounded-xl border bg-background/65 p-3'>
      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
        {icon}
      </div>

      <div className='min-w-0'>
        <p className='text-xs font-medium text-muted-foreground'>{label}</p>

        <p className='mt-1 break-words text-sm font-semibold'>{value}</p>
      </div>
    </div>
  )
}
