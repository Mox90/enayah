// enayah-forntend/src/modules/hr/employees/components/profile/employee-avatar-uploader.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, LoaderCircle, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

const ACCEPTED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface EmployeeAvatarUploaderProps {
  avatar?: string | null
  employeeName: string
  isRtl: boolean
  onUpload?: (file: File) => Promise<void>
  className?: string
}

export function EmployeeAvatarUploader({
  avatar,
  employeeName,
  isRtl,
  onUpload,
  className,
}: EmployeeAvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false)

  const uploadHint = isRtl
    ? 'JPG أو PNG أو WebP، بحد أقصى ٢ ميجابايت'
    : 'JPG, PNG or WebP, maximum 2 MB'

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const openFilePicker = () => {
    if (!onUpload || isUploading) {
      return
    }

    inputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    // Allow selecting the same file again.
    event.target.value = ''

    if (!file) {
      return
    }

    setError(null)

    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      setError(
        isRtl
          ? 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.'
          : 'Choose a JPG, PNG, or WebP image.',
      )
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError(
        isRtl
          ? 'يجب ألا يتجاوز حجم الصورة ٢ ميجابايت.'
          : 'The image must not exceed 2 MB.',
      )
      return
    }

    const newPreviewUrl = URL.createObjectURL(file)

    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return newPreviewUrl
    })

    try {
      setIsUploading(true)
      await onUpload?.(file)
    } catch {
      setError(
        isRtl
          ? 'تعذر تحميل الصورة. يرجى المحاولة مرة أخرى.'
          : 'Unable to upload the image. Please try again.',
      )

      URL.revokeObjectURL(newPreviewUrl)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const displayedAvatar = previewUrl || avatar || '/MODHS3.png'

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex w-full shrink-0 flex-col items-center',
          'lg:w-40',
          className,
        )}
      >
        <div className='group/avatar relative'>
          <div
            className={cn(
              'relative h-28 w-28 overflow-hidden rounded-full',
              'border-4 border-background bg-muted shadow-lg',
              'ring-1 ring-border',
              'sm:h-32 sm:w-32',
            )}
          >
            <Image
              src={displayedAvatar}
              alt={
                avatar || previewUrl
                  ? employeeName
                  : isRtl
                    ? 'الصورة الافتراضية للموظف'
                    : 'Default employee profile image'
              }
              fill
              priority
              unoptimized={Boolean(previewUrl)}
              sizes='(max-width: 640px) 112px, 128px'
              className='object-cover'
            />

            {onUpload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    onClick={openFilePicker}
                    disabled={isUploading}
                    aria-label={
                      isRtl ? 'تغيير صورة الموظف' : 'Change employee photo'
                    }
                    className={cn(
                      'absolute inset-0 flex items-center justify-center',
                      'bg-black/0 text-white opacity-0',
                      'transition-all duration-200',
                      'group-hover/avatar:bg-black/45',
                      'group-hover/avatar:opacity-100',
                      'focus-visible:bg-black/45',
                      'focus-visible:opacity-100',
                      'focus-visible:outline-none',
                      'focus-visible:ring-2',
                      'focus-visible:ring-primary',
                      'disabled:cursor-not-allowed',
                    )}
                  >
                    {isUploading ? (
                      <LoaderCircle
                        aria-hidden='true'
                        className='h-7 w-7 animate-spin'
                      />
                    ) : (
                      <Camera aria-hidden='true' className='h-7 w-7' />
                    )}
                  </button>
                </TooltipTrigger>

                <TooltipContent
                  side='bottom'
                  align='center'
                  className='max-w-64 text-center'
                >
                  {uploadHint}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {onUpload && !isUploading && (
            <div className='pointer-events-none absolute bottom-0 end-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md'>
              <Camera aria-hidden='true' className='h-4 w-4' />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className='sr-only'
          onChange={handleFileChange}
        />

        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={isUploading}
                onClick={openFilePicker}
                className='mt-2'
              >
                {isUploading ? (
                  <LoaderCircle
                    aria-hidden='true'
                    className='me-2 h-4 w-4 animate-spin'
                  />
                ) : (
                  <Upload aria-hidden='true' className='me-2 h-4 w-4' />
                )}

                {isUploading
                  ? isRtl
                    ? 'جارٍ التحميل...'
                    : 'Uploading...'
                  : isRtl
                    ? 'تحميل صورة'
                    : 'Upload photo'}
              </Button>
            </TooltipTrigger>

            <TooltipContent
              side='bottom'
              align='center'
              className='max-w-64 text-center'
            >
              {uploadHint}
            </TooltipContent>
          </Tooltip>
        )}

        {error && (
          <p
            role='alert'
            className='mt-2 text-center text-xs font-medium text-destructive'
          >
            {error}
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}
