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
  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>🤝 Memberships ({memberships.length})</CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Membership
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {memberships.length === 0 && (
          <div className='text-muted-foreground'>No Membership Records</div>
        )}

        {memberships.map((x) => (
          <div key={x.id} className='border rounded-lg p-4'>
            <div className='flex justify-between'>
              <div>
                <div className='font-semibold'>{x.organization}</div>

                <div>{x.membershipNumber}</div>

                <div>{x.membershipLevel}</div>

                {/* {x.specialty && <div>Specialty: {x.specialty}</div>} */}

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
              </div>

              <div className='flex flex-col gap-2'>
                <Badge
                  variant='outline'
                  className={
                    x.isVerified ? verifyClass.verified : verifyClass.unverified
                  }
                >
                  {x.isVerified ? 'Verified' : 'Unverified'}
                </Badge>

                <Badge>{x.status}</Badge>

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
