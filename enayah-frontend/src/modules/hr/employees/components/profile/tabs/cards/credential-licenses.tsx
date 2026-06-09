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

const verifyClass = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  unverified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

interface License {
  id: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string
  issueDate?: string
  expiryDate?: string
  status: string
  isVerified: boolean
}

interface Props {
  licenses: License[]
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
  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>📄📝 Licenses ({licenses.length})</CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add License
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {licenses.length === 0 && (
          <div className='text-muted-foreground'>No License Records</div>
        )}

        {licenses.map((x) => (
          <div key={x.id} className='border rounded-lg p-4'>
            <div className='flex justify-between'>
              <div>
                <div className='font-semibold'>{x.profession}</div>
                <div>Issuing Authority: {x.authority}</div>
                <div>License #: {x.licenseNumber}</div>
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
                <VerificationBadge verified={x.isVerified} />{' '}
                <StatusBadge status={x.status} />
              </div>

              <div className='flex flex-col gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit?.(x.id)}>
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => onDelete?.(x.id)}
                    >
                      Delete
                    </DropdownMenuItem>
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
