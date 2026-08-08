// enayah-frontend/src/modules/hr/credentials/components/credential-document-summary.tsx

'use client'

import { Download, Eye, FileImage, FileText, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useCredentialDocumentActions } from '../hooks/use-credential-document-actions'

import type {
  CredentialDocumentAccessService,
  CredentialDocumentMetadata,
} from '../types/credential-document.types'

export interface CredentialDocumentSummaryProps {
  employeeId: string
  credentialId: string
  document: CredentialDocumentMetadata
  service: CredentialDocumentAccessService
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

export function CredentialDocumentSummary({
  employeeId,
  credentialId,
  document,
  service,
  className,
}: CredentialDocumentSummaryProps) {
  const { previewDocument, downloadDocument, isPreviewing, isDownloading } =
    useCredentialDocumentActions({
      employeeId,
      credentialId,
      originalName: document.originalName,
      service,
    })

  const isBusy = isPreviewing || isDownloading

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

        <div className='flex shrink-0 gap-0'>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            disabled={isBusy}
            aria-label='Preview document'
            onClick={() => {
              void previewDocument()
            }}
          >
            {isPreviewing ? (
              <Loader2 aria-hidden='true' className='h-4 w-4 animate-spin' />
            ) : (
              <Eye aria-hidden='true' className='h-4 w-4' />
            )}
          </Button>

          <Button
            type='button'
            size='icon'
            variant='ghost'
            disabled={isBusy}
            aria-label='Download document'
            onClick={() => {
              void downloadDocument()
            }}
          >
            {isDownloading ? (
              <Loader2 aria-hidden='true' className='h-4 w-4 animate-spin' />
            ) : (
              <Download aria-hidden='true' className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
