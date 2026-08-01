// enayah-frontend/src/components/forms/credential-document-dropzone.tsx

'use client'

import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useRef,
  useState,
} from 'react'

import { FileCheck2, FileImage, FileText, UploadCloud, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 2 * 1024 * 1024

const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const ACCEPTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp'])

const FILE_INPUT_ACCEPT = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
].join(',')

interface CredentialDocumentDropzoneProps {
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  className?: string
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.trim().toLowerCase()

  return extension ?? ''
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) {
    return `${fileSize} B`
  }

  if (fileSize < 1024 * 1024) {
    return `${Math.ceil(fileSize / 1024)} KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
}

function isPdfFile(file: File): boolean {
  return (
    file.type.toLowerCase() === 'application/pdf' ||
    getFileExtension(file.name) === 'pdf'
  )
}

export function CredentialDocumentDropzone({
  value,
  onChange,
  disabled = false,
  className,
}: CredentialDocumentDropzoneProps) {
  const t = useTranslations('credentials.degreeDocument')

  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)

  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateFile(file: File): string | null {
    if (file.size <= 0) {
      return t('errors.empty')
    }

    if (file.size > MAX_FILE_SIZE) {
      return t('errors.size')
    }

    const mimeType = file.type.trim().toLowerCase()
    const extension = getFileExtension(file.name)

    /*
     * Some browsers may provide an empty or generic MIME type,
     * so the extension is used as a frontend fallback.
     *
     * The backend must still validate the actual file content.
     */
    const validMimeType = ACCEPTED_MIME_TYPES.has(mimeType)
    const validExtension = ACCEPTED_EXTENSIONS.has(extension)

    if (!validMimeType && !validExtension) {
      return t('errors.type')
    }

    return null
  }

  function selectFile(file: File | undefined): void {
    if (!file || disabled) {
      return
    }

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      onChange(null)
      return
    }

    setError(null)
    onChange(file)
  }

  function openFilePicker(): void {
    if (disabled) {
      return
    }

    inputRef.current?.click()
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    selectFile(event.currentTarget.files?.[0])

    /*
     * Reset the native input so the user can select the
     * same file again after removing it.
     */
    event.currentTarget.value = ''
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()

    if (disabled) {
      return
    }

    dragDepthRef.current += 1
    setIsDragging(true)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()

    if (!disabled) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()

    if (disabled) {
      return
    }

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)

    if (dragDepthRef.current === 0) {
      setIsDragging(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    event.stopPropagation()

    dragDepthRef.current = 0
    setIsDragging(false)

    if (disabled) {
      return
    }

    selectFile(event.dataTransfer.files?.[0])
  }

  function removeFile(): void {
    if (disabled) {
      return
    }

    setError(null)
    onChange(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        id={inputId}
        type='file'
        accept={FILE_INPUT_ACCEPT}
        className='sr-only'
        disabled={disabled}
        onChange={handleInputChange}
      />

      {!value ? (
        <div
          role='button'
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-describedby={`${inputId}-description`}
          className={cn(
            'group relative overflow-hidden rounded-2xl border-2 border-dashed',
            'px-5 py-8 text-center transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-primary focus-visible:ring-offset-2',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-muted-foreground/25 bg-background hover:border-primary/50 hover:bg-primary/[0.025]',
            error && 'border-destructive/60 bg-destructive/[0.025]',
          )}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openFilePicker()
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-emerald-500/[0.04] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />

          <div className='relative mx-auto flex max-w-md flex-col items-center'>
            <div
              className={cn(
                'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl',
                'bg-primary/10 text-primary transition-transform duration-200',
                'group-hover:scale-105',
                isDragging && 'scale-105',
              )}
            >
              <UploadCloud aria-hidden='true' className='h-7 w-7' />
            </div>

            <p className='text-sm font-semibold text-foreground'>
              {isDragging ? t('dropNow') : t('dropTitle')}
            </p>

            <p className='mt-1 text-sm text-muted-foreground'>{t('browse')}</p>

            <p
              id={`${inputId}-description`}
              className='mt-3 text-xs text-muted-foreground'
            >
              {t('supported')}
            </p>
          </div>
        </div>
      ) : (
        <div className='rounded-2xl border bg-background p-4 shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
              {isPdfFile(value) ? (
                <FileText aria-hidden='true' className='h-6 w-6' />
              ) : (
                <FileImage aria-hidden='true' className='h-6 w-6' />
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <FileCheck2
                  aria-hidden='true'
                  className='h-4 w-4 shrink-0 text-emerald-600'
                />

                <p
                  className='truncate text-sm font-semibold text-foreground'
                  title={value.name}
                >
                  {value.name}
                </p>
              </div>

              <p className='mt-1 text-xs text-muted-foreground'>
                {formatFileSize(value.size)}
              </p>
            </div>

            <Button
              type='button'
              size='icon'
              variant='ghost'
              disabled={disabled}
              aria-label={t('remove')}
              className='shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              onClick={removeFile}
            >
              <X aria-hidden='true' className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role='alert' className='text-sm font-medium text-destructive'>
          {error}
        </p>
      )}
    </div>
  )
}
