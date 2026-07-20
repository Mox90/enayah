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
import { MembershipInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'

const verifyClass = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  unverified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

// interface Membership {
//   id: string
//   organization: string
//   membershipNumber?: string
//   membershipLevel?: string
//   startDate?: string
//   issueDate?: string
//   expiryDate?: string
//   status: string
//   isVerified: boolean
// }

interface Props {
  memberships: MembershipInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialMemberships({
  memberships,
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
          🤝 {ct('memberLabel')} (
          {isRtl ? toPersianDigits(memberships.length) : memberships.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {ct('addMember')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {memberships.length === 0 && (
          <div className='text-muted-foreground'>
            {ct('noRecFound', { item: isRtl ? 'عضوية' : 'Membership' })}
          </div>
        )}

        {memberships.map((x) => {
          const xId = x.id
          return (
            <div key={x.id} className='border rounded-lg p-4'>
              <div className='flex justify-between'>
                <div>
                  <div className='font-semibold'>{x.organization}</div>

                  <div>{x.membershipNumber}</div>

                  <div>{x.membershipLevel}</div>

                  {/* {x.specialty && <div>Specialty: {x.specialty}</div>} */}

                  {x.startDate && (
                    <div>
                      {ct('issued')}:{' '}
                      {format(new Date(x.startDate), 'dd-MMM-yyyy')}
                    </div>
                  )}

                  {x.expiryDate && (
                    <div>
                      {ct('expires')}:{' '}
                      {format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
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
