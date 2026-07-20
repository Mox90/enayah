'use client'

import { format } from 'date-fns'
import { MoreHorizontal, MoreVertical, Plus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { LifeSupportInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'

//import { VerificationBadge } from '@/components/common/verification-badge'

// interface LifeSupport {
//   id: string
//   type: string
//   provider: string
//   certificateNumber: string | null
//   issueDate: string | null
//   expiryDate: string | null
//   isVerified: boolean
// }

interface Props {
  lifeSupports: LifeSupportInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialLifeSupport({
  lifeSupports,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function translateCredentialValue(value: string) {
    const knownKeys = [
      'aha',
      'sha',
      'bls',
      'acls',
      'pals',
      'atls',
      'stls',
      'nrp',
      'itls',
      'blso',
      'atcn',
      'also',
      'tncc',
      'enpc',
      'asls',
      'esls',
      'pfccs',
      'other',
    ]

    try {
      //return t(value).replace(/\s*\([^)]+\)$/, '')
      return knownKeys.includes(value)
        ? t(value).replace(/\s*\([^)]+\)$/, '')
        : value
    } catch {
      return value
    }
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          ❤️ {t('lifeSupportLabel')} (
          {isRtl ? toPersianDigits(lifeSupports.length) : lifeSupports.length})
        </CardTitle>

        {onAdd && (
          <Button size='sm' onClick={onAdd}>
            <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
            {t('addLifeSupport')}
          </Button>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {lifeSupports.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            {t('noRecFound', {
              item: isRtl ? 'شهادات دعم الحياة' : 'Life Support Certifications',
            })}
          </div>
        )}

        {lifeSupports.map((x, index) => (
          <div
            key={
              x.id ?? `${x.certificateNumber}-${x.certificateNumber}-${index}`
            }
            className='rounded-lg border p-4'
          >
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>
                  {/* {x.type.replaceAll('_', ' ')} */}
                  {translateCredentialValue(x.type)}
                </div>

                <div className='text-sm text-muted-foreground'>
                  {/* {x.provider} */}
                  {translateCredentialValue(x.provider)}
                </div>

                {x.certificateNumber && (
                  <div className='text-sm'>
                    {t('certificateNum')}: {x.certificateNumber}
                  </div>
                )}

                {x.issueDate && (
                  <div className='text-sm'>
                    {t('issued')}:{' '}
                    {isRtl
                      ? toArabic(x.issueDate, 1)
                      : format(new Date(x.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {x.expiryDate && (
                  <div className='text-sm'>
                    {t('expires')}:{' '}
                    {isRtl
                      ? toArabic(x.expiryDate, 1)
                      : format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {/* <VerificationBadge verified={x.isVerified ?? false} /> */}
              </div>

              {/* <div className='flex flex-col items-end gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreVertical className='h-4 w-4 text-green-700' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {onEdit && (
                      <DropdownMenuItem
                        className={
                          isRtl
                            ? 'justify-end text-right'
                            : 'justify-start text-left'
                        }
                        onClick={() => {
                          if (!x.id) return
                          onEdit(x.id)
                        }}
                      >
                        {t('edit')}
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        className={`text-red-600 ${
                          isRtl
                            ? 'justify-end text-right'
                            : 'justify-start text-left'
                        }`}
                        onClick={() => {
                          if (!x.id) return
                          onDelete(x.id)
                        }}
                      >
                        {t('delete')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
              <RowActions
                onEdit={() => onEdit?.(x.id!)}
                onDelete={() => onDelete?.(x.id!)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
