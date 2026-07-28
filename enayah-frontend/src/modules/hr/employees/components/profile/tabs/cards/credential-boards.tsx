// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-boards.tsx

'use client'

import { format, isValid, parseISO } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Award, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { BoardInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { toPersianDigits } from '@/utils/utilities'

interface Props {
  boards: BoardInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

interface DetailItemProps {
  label: string
  value?: React.ReactNode
  valueDirection?: 'ltr' | 'rtl'
}

function DetailItem({ label, value, valueDirection }: DetailItemProps) {
  return (
    <div className='min-w-0'>
      <div className='mb-1 text-xs font-medium text-muted-foreground'>
        {label}
      </div>

      <div
        className='break-words text-sm font-medium text-foreground'
        dir={valueDirection}
      >
        {value || '-'}
      </div>
    </div>
  )
}

function formatBoardDate(value: string | null | undefined, isRtl: boolean) {
  if (!value) return '-'

  const parsedDate = parseISO(value)

  if (!isValid(parsedDate)) {
    return '-'
  }

  const formattedDate = format(parsedDate, 'dd-MMM-yyyy', {
    locale: isRtl ? arSA : enUS,
  })

  return isRtl ? toPersianDigits(formattedDate) : formattedDate
}

export function CredentialBoards({ boards, onAdd, onEdit, onDelete }: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'

  const displayedCount = isRtl ? toPersianDigits(boards.length) : boards.length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10'>
              <Award
                aria-hidden='true'
                className='h-5 w-5 text-violet-600 dark:text-violet-400'
              />
            </div>

            <div className='flex min-w-0 items-center gap-2'>
              <span className='truncate text-base font-semibold'>
                {ct('boardCertificationLabel')}
              </span>

              <span className='inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'>
                {displayedCount}
              </span>
            </div>
          </CardTitle>

          {onAdd && (
            <Button
              type='button'
              size='sm'
              onClick={onAdd}
              className='w-full sm:w-auto'
            >
              <Plus aria-hidden='true' className='me-2 h-4 w-4' />
              {ct('addBoard')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {boards.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
              <Award
                aria-hidden='true'
                className='h-5 w-5 text-muted-foreground'
              />
            </div>

            <p className='text-sm text-muted-foreground'>
              {ct('noRecFound', {
                item: ct('boardCertificationLabel'),
              })}
            </p>

            {onAdd && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-4'
                onClick={onAdd}
              >
                <Plus aria-hidden='true' className='me-2 h-4 w-4' />
                {ct('addBoard')}
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {boards.map((board, index) => {
              const boardId = board.id

              return (
                <article
                  key={boardId ?? `${board.boardName}-${index}`}
                  className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
                >
                  <div className='mb-5 flex items-start justify-between gap-4 border-b pb-4'>
                    <div className='min-w-0'>
                      <h3 className='break-words text-base font-semibold text-foreground'>
                        {board.boardName || '-'}
                      </h3>

                      {board.specialty && (
                        <p className='mt-1 break-words text-sm text-muted-foreground'>
                          {board.specialty}
                        </p>
                      )}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <VerificationBadge
                          verified={board.isVerified ?? false}
                        />

                        <ExpiryStatusBadge
                          expiryDate={board.expiryDate}
                          showAttentionPulse
                        />
                      </div>
                    </div>

                    <div className='relative z-20 shrink-0'>
                      <RowActions
                        onEdit={
                          boardId && onEdit ? () => onEdit(boardId) : undefined
                        }
                        onDelete={
                          boardId && onDelete
                            ? () => onDelete(boardId)
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
                    <DetailItem
                      label={ct('issuingBody')}
                      value={board.issuingBody}
                    />

                    <DetailItem
                      label={ct('issued')}
                      value={formatBoardDate(board.issueDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatBoardDate(board.expiryDate, isRtl)}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
