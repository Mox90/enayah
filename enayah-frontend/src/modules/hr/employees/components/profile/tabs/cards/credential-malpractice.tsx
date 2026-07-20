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
import { MalpracticeInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toArabic, toArabicDigits, toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'

//import { VerificationBadge } from '@/components/common/verification-badge'

// interface Malpractice {
//   id: string
//   insuranceCompany: string
//   policyNumber: string
//   coverageAmount: string | number | null
//   startDate: string | null
//   expiryDate: string | null
//   isVerified: boolean
// }

interface Props {
  malpractice: MalpracticeInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialMalpractice({
  malpractice,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          🛡️ {ct('malpracticeLabel')} (
          {isRtl ? toPersianDigits(malpractice.length) : malpractice.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {ct('addMalpractice')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {malpractice.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            {ct('noRecFound', { item: 'Malpractice Insurance' })}
          </div>
        )}

        {malpractice.map((x) => {
          const xId = x.id
          return (
            <div key={x.id} className='rounded-lg border p-4'>
              <div className='flex justify-between'>
                <div className='space-y-1'>
                  <div className='font-semibold'>{x.insuranceCompany}</div>

                  <div className='text-sm text-muted-foreground'>
                    {ct('policyNum')}: {x.policyNumber}
                  </div>

                  {x.coverageAmount && (
                    <div className='text-sm'>
                      {ct('amount')}: {x.coverageAmount}
                    </div>
                  )}

                  {x.startDate && (
                    <div className='text-sm'>
                      {ct('startDate')}:{' '}
                      {isRtl
                        ? toArabic(x.startDate, 1)
                        : format(new Date(x.startDate), 'dd-MMM-yyyy')}
                    </div>
                  )}

                  {x.expiryDate && (
                    <div className='text-sm'>
                      {ct('expires')}:{' '}
                      {isRtl
                        ? toArabic(x.expiryDate, 1)
                        : format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                    </div>
                  )}

                  <VerificationBadge verified={x.isVerified ?? false} />
                </div>

                <RowActions
                  onEdit={xId && onEdit ? () => onEdit(xId) : undefined}
                  onDelete={xId && onDelete ? () => onDelete(xId) : undefined}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
