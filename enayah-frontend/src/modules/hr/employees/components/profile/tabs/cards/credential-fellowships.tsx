'use client'

import { format } from 'date-fns'
import { MoreHorizontal, MoreVertical, Plus } from 'lucide-react'

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { FellowshipInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { cn } from '@/lib/utils'
import { RowActions } from '@/components/dialogs/row-actions'

// interface Fellowship {
//   id: string
//   fellowshipName: string
//   fellowshipNumber?: string
//   abbreviation?: string
//   issuingBody: string
//   specialty?: string
//   //startDate?: string
//   issueDate?: string
//   expiryDate?: string
//   //status: string
//   isVerified: boolean
// }

interface Props {
  fellowships: FellowshipInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialFellowships({
  fellowships,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'
  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>
          🏅 {ct('fellowLabel')} (
          {isRtl ? toPersianDigits(fellowships.length) : fellowships.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {ct('addFellow')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {fellowships.length === 0 && (
          <div className='text-muted-foreground'>
            {ct('noRecFound', { item: isRtl ? 'الزمالة' : 'Fellowship' })}
          </div>
        )}

        {fellowships.map((x, index) => (
          <div
            key={x.id ?? `${x.fellowshipName}-${index}`}
            className='border rounded-lg p-4'
          >
            <div className='flex justify-between'>
              <div>
                <div className='font-semibold'>{x.fellowshipName}</div>

                <div>{x.abbreviation}</div>

                <div>
                  {ct('issuingBody')}: {x.issuingBody}
                </div>

                {x.specialty && (
                  <div>
                    {ct('specialty')}: {x.specialty}
                  </div>
                )}

                {x.issueDate && (
                  <div>
                    {ct('issued')}:{' '}
                    {isRtl
                      ? toArabic(x.issueDate, 1)
                      : format(new Date(x.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {x.expiryDate && (
                  <div>
                    {ct('expires')}:{' '}
                    {isRtl
                      ? toArabic(x.expiryDate, 1)
                      : format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <VerificationBadge verified={x.isVerified ?? false} />
                {/* <Badge>{x.status}</Badge> */}
              </div>

              {/* <div className='flex flex-col gap-2'>
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
                        {ct('edit')}
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
                        {ct('delete')}
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
