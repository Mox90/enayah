// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-degrees.tsx

'use client'

import { GraduationCap, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { DegreeInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { cn } from '@/lib/utils'
import { formatDate, toPersianDigits } from '@/utils/utilities'
import { DetailItem } from '@/components/forms/form-detail-item'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { CredentialVerificationSummary } from '@/modules/hr/credentials/components/credential-verification-summary'
import { degreeVerificationService } from '@/modules/hr/credentials/services/credential-verification.service'
import { degreeDocumentService } from '@/modules/hr/credentials/services/credential-document.service'

interface Props {
  degrees: DegreeInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
  // documentFileId?: string | null
  // document?: CredentialDocumentMetadata | null
}

export const degreeTypeColors: Record<string, string> = {
  doctorate:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300',

  master:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',

  bachelor:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',

  diploma:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',

  associate:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',

  other:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
}

export function CredentialDegrees({
  degrees,
  employeeId,
  onAdd,
  onEdit,
  onDelete,
  onVerify,
}: Props) {
  const ct = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const displayedCount = isRtl
    ? toPersianDigits(degrees.length)
    : degrees.length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <CardTitle className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10'>
                <GraduationCap
                  aria-hidden='true'
                  className='h-5 w-5 text-emerald-600 dark:text-emerald-400'
                />
              </div>

              <div className='flex min-w-0 items-center gap-2'>
                <span className='truncate text-base font-semibold'>
                  {ct('highestEducationalLabel')}
                </span>

                <span className='inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'>
                  {displayedCount}
                </span>
              </div>
            </CardTitle>

            <p className='mt-2 ps-[52px] text-sm text-muted-foreground'>
              {ct('highestEducationalSub')}
            </p>
          </div>

          {onAdd && (
            <Button
              type='button'
              size='sm'
              onClick={onAdd}
              className='w-full shrink-0 sm:w-auto'
            >
              <Plus aria-hidden='true' className='me-2 h-4 w-4' />
              {ct('addDegree')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {degrees.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
              <GraduationCap
                aria-hidden='true'
                className='h-5 w-5 text-muted-foreground'
              />
            </div>

            <p className='text-sm text-muted-foreground'>
              {ct('noRecFound', {
                item: ct('highestEducationalLabel'),
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
                {ct('addDegree')}
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              //'grid grid-cols-1 auto-rows-fr items-stretch gap-4',
              'grid grid-cols-1 items-start gap-4',
              degrees.length === 2 && 'lg:grid-cols-2',
              degrees.length === 3 && 'lg:grid-cols-2 xl:grid-cols-3',
              degrees.length >= 4 &&
                'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
            )}
          >
            {degrees.map((degree, index) => {
              const degreeId = degree.id

              const isVerified =
                degree.verification?.isVerified ?? degree.isVerified ?? false

              const degreeTypeClass =
                degreeTypeColors[degree.degreeType] ?? degreeTypeColors.other

              return (
                <article
                  key={
                    degreeId ??
                    `${degree.degreeName}-${degree.institution}-${index}`
                  }
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
                        {degree.degreeName || '-'}
                      </h3>

                      {degree.institution && (
                        <p className='mt-1 break-words text-sm text-muted-foreground'>
                          {degree.institution}
                        </p>
                      )}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <VerificationBadge verified={isVerified} />

                        <Badge
                          variant='outline'
                          className={cn(
                            'justify-center whitespace-nowrap rounded-full',
                            'px-2.5 py-1 text-xs font-semibold',
                            'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                            degreeTypeClass,
                          )}
                        >
                          {ct.has(degree.degreeType)
                            ? ct(degree.degreeType)
                            : degree.degreeType
                                .replaceAll('_', ' ')
                                .replace(/\b\w/g, (character) =>
                                  character.toUpperCase(),
                                )}
                        </Badge>
                      </div>
                    </div>

                    <div className='relative z-20 shrink-0'>
                      <RowActions
                        onEdit={
                          degreeId && onEdit
                            ? () => onEdit(degreeId)
                            : undefined
                        }
                        onDelete={
                          degreeId && onDelete
                            ? () => onDelete(degreeId)
                            : undefined
                        }
                        onVerify={
                          degreeId && onVerify
                            ? () => onVerify(degreeId)
                            : undefined
                        }
                        confirmDelete
                        deleteItemName={ct('degree')}
                      />
                    </div>
                  </div>

                  {/* <div className='grid flex-1 content-start gap-x-6 gap-y-5 sm:grid-cols-2'> */}
                  <div className='grid content-start gap-x-6 gap-y-5 sm:grid-cols-2'>
                    <DetailItem
                      label={ct('institution')}
                      value={degree.institution}
                    />

                    <DetailItem label={ct('major')} value={degree.major} />

                    <DetailItem
                      label={ct('graduated')}
                      value={formatDate(degree.graduationDate, isRtl)}
                    />
                  </div>

                  {employeeId && degreeId && degree.document && (
                    <div className='mt-5 border-t pt-4'>
                      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {ct('credentialDocument.currentTitle')}
                      </p>

                      <CredentialDocumentSummary
                        employeeId={employeeId}
                        credentialId={degreeId}
                        document={degree.document}
                        service={degreeDocumentService}
                      />
                    </div>
                  )}
                  {employeeId &&
                    degreeId &&
                    isVerified &&
                    degree.verification && (
                      <CredentialVerificationSummary
                        employeeId={employeeId}
                        credentialId={degreeId}
                        verification={degree.verification}
                        service={degreeVerificationService}
                        {...(onVerify
                          ? {
                              onManage: () => onVerify(degreeId),
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
