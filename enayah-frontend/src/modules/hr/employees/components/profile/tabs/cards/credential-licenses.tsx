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
import { StatusBadge } from '@/components/badges/status-badge'
import { LicenseInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'

const verifyClass = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  unverified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

// interface License {
//   id: string
//   authority: string
//   licenseNumber: string
//   profession: string
//   specialty?: string
//   issueDate?: string
//   expiryDate?: string
//   status: string
//   isVerified: boolean
// }

interface Props {
  licenses: LicenseInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialLicenses({
  licenses,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const ct = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>
          📄 {ct('licenseLabel')} (
          {isRtl ? toPersianDigits(licenses.length) : licenses.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {ct('addLicense')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {licenses.length === 0 && (
          <div className='text-muted-foreground'>
            {ct('noRecFound', { item: isRtl ? 'التراخيص' : 'License' })}
          </div>
        )}

        {licenses.map((x) => (
          <div key={x.id} className='border rounded-lg p-4'>
            <div className='flex justify-between'>
              <div>
                <div className='font-semibold'>{x.profession}</div>
                <div>
                  {ct('issuingAuthority')}: {x.authority}
                </div>
                <div>
                  {ct('licenseNum')}: {x.licenseNumber}
                </div>
                {x.specialty && (
                  <div>
                    {ct('specialty')}: {x.specialty}
                  </div>
                )}
                {x.issueDate && (
                  <div>
                    {ct('issued')}:{' '}
                    {format(new Date(x.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}
                {x.expiryDate && (
                  <div>
                    {ct('expires')}:{' '}
                    {format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}
                <VerificationBadge verified={x.isVerified ?? false} />{' '}
                <StatusBadge status={x.status} />
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
