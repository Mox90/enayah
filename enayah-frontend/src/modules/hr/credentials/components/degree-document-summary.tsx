'use client'

import { Download, Eye, FileImage, FileText, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useDegreeDocumentActions } from '../hooks/use-degree-document-actions'
import type { CredentialDocumentMetadata } from '../types/credential-document.types'

interface DegreeDocumentSummaryProps {
  employeeId: string
  degreeId: string
  document: CredentialDocumentMetadata
  className?: string
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1_024) {
    return `${fileSize} B`
  }

  if (fileSize < 1_024 * 1_024) {
    return `${Math.ceil(fileSize / 1_024)} KB`
  }

  return `${(fileSize / (1_024 * 1_024)).toFixed(2)} MB`
}

function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

export function DegreeDocumentSummary({
  employeeId,
  degreeId,
  document,
  className,
}: DegreeDocumentSummaryProps) {
  const t = useTranslations('credentials.degreeDocument')

  const { previewDocument, downloadDocument, isPreviewing, isDownloading } =
    useDegreeDocumentActions({
      employeeId,
      degreeId,
      originalName: document.originalName,
    })

  return (
    <div className={cn('rounded-xl border bg-muted/20 p-3', className)}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            {isPdf(document.mimeType) ? (
              <FileText aria-hidden='true' className='h-5 w-5' />
            ) : (
              <FileImage aria-hidden='true' className='h-5 w-5' />
            )}
          </div>

          <div className='min-w-0'>
            <p
              className='truncate text-sm font-medium text-foreground'
              title={document.originalName}
            >
              {document.originalName}
            </p>

            <p className='mt-0.5 text-xs text-muted-foreground'>
              {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={isPreviewing || isDownloading}
            onClick={() => {
              void previewDocument()
            }}
          >
            {isPreviewing ? (
              <Loader2
                aria-hidden='true'
                className='me-2 h-4 w-4 animate-spin'
              />
            ) : (
              <Eye aria-hidden='true' className='me-2 h-4 w-4' />
            )}

            {t('preview')}
          </Button>

          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={isPreviewing || isDownloading}
            onClick={() => {
              void downloadDocument()
            }}
          >
            {isDownloading ? (
              <Loader2
                aria-hidden='true'
                className='me-2 h-4 w-4 animate-spin'
              />
            ) : (
              <Download aria-hidden='true' className='me-2 h-4 w-4' />
            )}

            {t('download')}
          </Button>
        </div>
      </div>
    </div>
  )
}
