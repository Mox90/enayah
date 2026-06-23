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
import { BoardInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toArabic, toPersianDigits } from '@/utils/utilities'

// interface Board {
//   id: string
//   boardName: string
//   issuingBody: string | null
//   specialty: string | null
//   issueDate: string | null
//   expiryDate: string | null
//   isVerified: boolean
// }

interface Props {
  boards: BoardInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CredentialBoards({ boards, onAdd, onEdit, onDelete }: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          📜 {ct('boardCertificationLabel')} (
          {isRtl ? toPersianDigits(boards.length) : boards.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {ct('addBoard')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {boards.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            {ct.rich('noRecFound', {
              item: isRtl ? 'شهادات المجلس' : 'Board Certifications',
            })}
          </div>
        )}

        {boards.map((board, index) => (
          <div
            key={board.id ?? `${board.boardName}-${index}`}
            className='rounded-lg border p-4'
          >
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>{board.boardName}</div>

                {board.issuingBody && (
                  <div className='text-sm text-muted-foreground'>
                    {ct('issuingBody')}: {board.issuingBody}
                  </div>
                )}

                {board.specialty && (
                  <div className='text-sm text-muted-foreground'>
                    {ct('specialty')}: {board.specialty}
                  </div>
                )}

                {board.issueDate && (
                  <div className='text-sm'>
                    {ct('issued')}:{' '}
                    {isRtl
                      ? toArabic(board.issueDate, 1)
                      : format(new Date(board.issueDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                {board.expiryDate && (
                  <div className='text-sm'>
                    {ct('expires')}:{' '}
                    {isRtl
                      ? toArabic(board.expiryDate, 1)
                      : format(new Date(board.expiryDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <VerificationBadge verified={board.isVerified ?? false} />
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
                        className={
                          isRtl
                            ? 'justify-end text-right'
                            : 'justify-start text-left'
                        }
                        onClick={() => {
                          if (!board.id) return
                          onEdit(board.id)
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
                          if (!board.id) return
                          onDelete(board.id)
                        }}
                      >
                        {ct('delete')}
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
