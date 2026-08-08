// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-boards.tsx

'use client'

import { Award, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { BoardInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { formatDate, toPersianDigits } from '@/utils/utilities'
import { DetailItem } from '@/components/forms/form-detail-item'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { boardDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { CredentialVerificationSummary } from '@/modules/hr/credentials/components/credential-verification-summary'
import { boardVerificationService } from '@/modules/hr/credentials/services/credential-verification.service'

interface Props {
  boards: BoardInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
}

export function CredentialBoards({
  boards,
  employeeId,
  onAdd,
  onEdit,
  onDelete,
  onVerify,
}: Props) {
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

              const isVerified =
                board.verification?.isVerified ?? board.isVerified ?? false

              return (
                <article
                  key={boardId ?? `${board.boardName}-${index}`}
                  // className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
                  className={cn(
                    //'relative flex h-full min-w-0 flex-col rounded-xl border bg-card',
                    //'p-4 shadow-sm transition-all duration-200 sm:p-5',
                    //'hover:border-primary/20 hover:shadow-md',
                    'relative flex min-w-0 flex-col rounded-xl border bg-card',
                    'p-4 shadow-sm transition-all duration-200 sm:p-5',
                    'hover:border-primary/20 hover:shadow-md',
                    isVerified &&
                      'border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.04)]',
                  )}
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
                        {/* <VerificationBadge
                          verified={board.isVerified ?? false}
                        /> */}
                        <VerificationBadge verified={isVerified} />

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
                        onVerify={
                          boardId && onVerify
                            ? () => onVerify(boardId)
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
                      value={formatDate(board.issueDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatDate(board.expiryDate, isRtl)}
                    />
                  </div>
                  {employeeId && boardId && board.document && (
                    <div className='mt-5 border-t pt-4'>
                      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {ct('degreeDocument.currentTitle')}
                      </p>

                      <CredentialDocumentSummary
                        employeeId={employeeId}
                        credentialId={boardId}
                        document={board.document}
                        service={boardDocumentService}
                      />
                    </div>
                  )}
                  {employeeId &&
                    boardId &&
                    isVerified &&
                    board.verification && (
                      <CredentialVerificationSummary
                        employeeId={employeeId}
                        credentialId={boardId}
                        verification={board.verification}
                        service={boardVerificationService}
                        {...(onVerify
                          ? {
                              onManage: () => onVerify(boardId),
                            }
                          : {})}
                      />
                    )}
                </article>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
