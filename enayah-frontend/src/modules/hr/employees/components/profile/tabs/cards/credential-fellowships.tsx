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
  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>🏅 Fellowships ({fellowships.length})</CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Fellowship
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {fellowships.length === 0 && (
          <div className='text-muted-foreground'>No Fellowship Records</div>
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

                <div>Issuing Body: {x.issuingBody}</div>

                {x.specialty && <div>Specialty: {x.specialty}</div>}

                {x.issueDate && (
                  <div>
                    Issued: {format(new Date(x.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {x.expiryDate && (
                  <div>
                    Expiry: {format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <VerificationBadge verified={x.isVerified ?? false} />
                {/* <Badge>{x.status}</Badge> */}
              </div>

              <div className='flex flex-col gap-2'>
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
