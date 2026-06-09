'use client'

import { format } from 'date-fns'

import { MoreHorizontal, Plus } from 'lucide-react'

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

interface Board {
  id: string
  boardName: string
  issuingBody: string | null
  specialty: string | null
  issueDate: string | null
  expiryDate: string | null
  isVerified: boolean
}

interface Props {
  boards: Board[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialBoards({ boards, onAdd, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>📜 Board Certifications ({boards.length})</CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Board
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {boards.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No Board Certifications
          </div>
        )}

        {boards.map((board) => (
          <div key={board.id} className='rounded-lg border p-4'>
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>{board.boardName}</div>

                {board.issuingBody && (
                  <div className='text-sm text-muted-foreground'>
                    Issuing Body: {board.issuingBody}
                  </div>
                )}

                {board.specialty && (
                  <div className='text-sm text-muted-foreground'>
                    Specialty: {board.specialty}
                  </div>
                )}

                {board.issueDate && (
                  <div className='text-sm'>
                    Issued: {format(new Date(board.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {board.expiryDate && (
                  <div className='text-sm'>
                    Expires: {format(new Date(board.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <VerificationBadge verified={board.isVerified} />
              </div>

              <div className='flex flex-col items-end gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => onEdit?.(board.id)}>
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => onDelete?.(board.id)}
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
