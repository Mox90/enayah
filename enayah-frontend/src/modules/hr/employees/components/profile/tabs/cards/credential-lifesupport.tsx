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
import { LifeSupportInput } from '@/modules/hr/onboarding/types/onboarding.types'

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
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          ❤️ Life Support Certifications ({lifeSupports.length})
        </CardTitle>

        {onAdd && (
          <Button size='sm' onClick={onAdd}>
            Add
          </Button>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {lifeSupports.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No Life Support Certifications
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
                <div className='font-semibold uppercase'>
                  {x.type.replaceAll('_', ' ')}
                </div>

                <div className='text-sm text-muted-foreground'>
                  {x.provider}
                </div>

                {x.certificateNumber && (
                  <div className='text-sm'>
                    Certificate #: {x.certificateNumber}
                  </div>
                )}

                {x.issueDate && (
                  <div className='text-sm'>
                    Issue Date: {format(new Date(x.issueDate), 'dd-MMM-yyyy')}
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
