'use client'

import { format } from 'date-fns'
import { MoreHorizontal, MoreVertical } from 'lucide-react'

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
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>🛡️ Malpractice Insurance ({malpractice.length})</CardTitle>

        {onAdd && (
          <Button size='sm' onClick={onAdd}>
            Add
          </Button>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {malpractice.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No Malpractice Insurance
          </div>
        )}

        {malpractice.map((x) => (
          <div key={x.id} className='rounded-lg border p-4'>
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>{x.insuranceCompany}</div>

                <div className='text-sm text-muted-foreground'>
                  Policy #: {x.policyNumber}
                </div>

                {x.coverageAmount && (
                  <div className='text-sm'>
                    Coverage Amount: {x.coverageAmount}
                  </div>
                )}

                {x.startDate && (
                  <div className='text-sm'>
                    Start Date: {format(new Date(x.startDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {x.expiryDate && (
                  <div className='text-sm'>
                    Expiry Date: {format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <VerificationBadge verified={x.isVerified} />
              </div>

              <div className='flex flex-col items-end gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (!x.id) return
                          onEdit(x.id)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => {
                          if (!x.id) return
                          onDelete(x.id)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
