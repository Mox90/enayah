'use client'

import { format } from 'date-fns'

import { MoreHorizontal, MoreVertical, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VerificationBadge } from '@/components/badges/verification-badge'

interface Degree {
  id: string
  degreeType: string
  degreeName: string
  major: string | null
  institution: string
  graduationDate: string | null
  isVerified: boolean
}

interface Props {
  degrees: Degree[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const degreeTypeLabel: Record<string, string> = {
  diploma: 'Diploma',
  associate: 'Associate',
  bachelor: 'Bachelor',
  master: 'Master',
  doctorate: 'Doctorate',
  other: 'Other',
}

const statusClass: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  on_leave: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  transferred: 'bg-blue-100 text-blue-700 border-blue-200',
  resigned: 'bg-orange-100 text-orange-700 border-orange-200',
  eoc: 'bg-purple-100 text-purple-700 border-purple-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
}

export function CredentialDegrees({ degrees, onAdd, onEdit, onDelete }: Props) {
  //console.log(degrees)
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>🎓 Degrees ({degrees.length})</CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Degree
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {degrees.length === 0 && (
          <div className='text-sm text-muted-foreground'>No Degree Records</div>
        )}

        {degrees.map((degree) => (
          <div key={degree.id} className='rounded-lg border p-4'>
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>{degree.degreeName}</div>

                <div className='text-sm text-muted-foreground'>
                  {degree.institution}
                </div>

                {degree.major && (
                  <div className='text-sm'>Major: {degree.major}</div>
                )}

                {degree.graduationDate && (
                  <div className='text-sm'>
                    Graduated:{' '}
                    {format(new Date(degree.graduationDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <div className='text-sm'>
                  Type:{' '}
                  {degreeTypeLabel[degree.degreeType.replace('_', ' ') ?? ''] ??
                    degree.degreeType.replace('_', ' ')}
                </div>

                <VerificationBadge verified={degree.isVerified} />
              </div>

              <div className='flex flex-col items-end gap-2'>
                {/* <Badge variant={degree.isVerified ? 'default' : 'secondary'}>
                  {degree.isVerified ? 'Verified' : 'Unverified'}
                </Badge> */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => onEdit?.(degree.id)}>
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => onDelete?.(degree.id)}
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
