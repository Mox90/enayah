// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-degrees.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, GraduationCap, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { VerificationBadge } from '@/components/badges/verification-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { DetailItem } from '@/components/forms/form-detail-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { CredentialVerificationSummary } from '@/modules/hr/credentials/components/credential-verification-summary'
import { degreeDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { degreeVerificationService } from '@/modules/hr/credentials/services/credential-verification.service'
import { DegreeInput } from '@/modules/hr/onboarding/types/onboarding.types'

import { cn } from '@/lib/utils'
import { formatDate, toPersianDigits } from '@/utils/utilities'

interface Props {
  degrees: DegreeInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
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

  const [isOpen, setIsOpen] = useState(false)

  const displayedCount = isRtl
    ? toPersianDigits(degrees.length)
    : degrees.length

  return (
    <Card className='overflow-hidden transition-all duration-200 hover:shadow-md'>
      {/* =========================================================
          Section Header
      ========================================================= */}
      <CardHeader
        className={cn(
          'bg-muted/20 px-3 py-3 transition-colors duration-200 sm:px-6 sm:py-4',
          isOpen && 'border-b',
        )}
      >
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4'>
          {/* Collapsible title area */}
          <button
            type='button'
            onClick={() => setIsOpen((previous) => !previous)}
            aria-expanded={isOpen}
            aria-controls='credential-degrees-content'
            className={cn(
              'group min-w-0 text-start',
              'rounded-md outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2',
            )}
          >
            <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
              {/* Section icon */}
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-lg',
                  'h-9 w-9 sm:h-10 sm:w-10 sm:rounded-xl',
                  'bg-emerald-500/10',
                )}
              >
                <GraduationCap
                  aria-hidden='true'
                  className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400'
                />
              </div>

              {/* Title + subtitle */}
              <div className='min-w-0 flex-1'>
                {/* Title row */}
                <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
                  <span className='min-w-0 truncate text-sm font-semibold text-foreground sm:text-base'>
                    {ct('highestEducationalLabel')}
                  </span>

                  {/* Record count */}
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center',
                      'min-w-5 rounded-full bg-muted px-1.5 py-0.5',
                      'text-[10px] font-semibold text-muted-foreground',
                      'sm:min-w-6 sm:px-2 sm:text-xs',
                    )}
                  >
                    {displayedCount}
                  </span>

                  {/* Collapse indicator */}
                  <ChevronDown
                    aria-hidden='true'
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-muted-foreground',
                      'transition-transform duration-200',
                      'sm:h-4 sm:w-4',
                      'group-hover:text-foreground',
                      !isOpen && (isRtl ? 'rotate-90' : '-rotate-90'),
                    )}
                  />
                </div>

                {/* Subtitle
                    Hidden on very narrow devices.
                    Shows from 430px upward.
                */}
                <p
                  className={cn(
                    'mt-1 hidden truncate text-xs text-muted-foreground',
                    'min-[430px]:block sm:text-sm',
                  )}
                >
                  {ct('highestEducationalSub')}
                </p>
              </div>
            </div>
          </button>

          {/* Add degree */}
          {onAdd && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  onClick={onAdd}
                  aria-label={ct('addDegree')}
                  className={cn(
                    'h-8 w-8 shrink-0 rounded-full',
                    'border-emerald-500/30',
                    'bg-emerald-500/10 text-emerald-600',
                    'shadow-sm',
                    'transition-all duration-200',
                    'hover:border-emerald-500',
                    'hover:bg-emerald-500 hover:text-white',
                    'hover:shadow-md',
                    'focus-visible:ring-emerald-500/40',
                    'dark:text-emerald-400',
                    'dark:hover:text-white',
                  )}
                >
                  <Plus aria-hidden='true' className='h-4 w-4' />
                </Button>
              </TooltipTrigger>

              <TooltipContent side='top'>{ct('addDegree')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>

      {/* =========================================================
          Section Content
      ========================================================= */}
      {isOpen && (
        <CardContent id='credential-degrees-content' className='p-5'>
          {degrees.length === 0 ? (
            /* =====================================================
                Empty State
            ===================================================== */
            <div
              className={cn(
                'rounded-xl border border-dashed',
                'bg-muted/10 px-6 py-10 text-center',
              )}
            >
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
            /* =====================================================
                Degrees Grid
            ===================================================== */
            <div
              className={cn(
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

                const degreeTypeLabel = ct.has(degree.degreeType)
                  ? ct(degree.degreeType)
                  : degree.degreeType
                      .replaceAll('_', ' ')
                      .replace(/\b\w/g, (character) => character.toUpperCase())

                const hasDocument =
                  Boolean(employeeId) &&
                  Boolean(degreeId) &&
                  Boolean(degree.document)

                const hasVerification =
                  Boolean(employeeId) &&
                  Boolean(degreeId) &&
                  isVerified &&
                  Boolean(degree.verification)

                const hasCredentialMeta = hasDocument || hasVerification

                return (
                  <article
                    key={
                      degreeId ??
                      `${degree.degreeName}-${degree.institution}-${index}`
                    }
                    className={cn(
                      'relative flex min-w-0 flex-col overflow-hidden',
                      'rounded-xl border bg-card',
                      'p-4 shadow-sm sm:p-5',
                      'transition-all duration-200',
                      'hover:border-primary/20 hover:shadow-md',

                      isVerified &&
                        'border-emerald-500/30 dark:border-emerald-500/25',
                    )}
                  >
                    {/* Verified accent */}
                    {isVerified && (
                      <div
                        aria-hidden='true'
                        className='absolute inset-y-0 start-0 w-1 bg-emerald-500'
                      />
                    )}

                    {/* =================================================
                        Degree Header
                    ================================================= */}
                    <div className='mb-4 flex items-start justify-between gap-4 border-b pb-3'>
                      <div className='min-w-0 flex-1'>
                        {/* Degree name */}
                        <h3 className='break-words text-base font-semibold leading-snug text-foreground'>
                          {degree.degreeName || '-'}
                        </h3>

                        {/* Institution */}
                        {degree.institution && (
                          <p className='mt-1 break-words text-sm leading-relaxed text-muted-foreground'>
                            {degree.institution}
                          </p>
                        )}

                        {/* Status badges */}
                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                          {/* Degree type first */}
                          <Badge
                            variant='outline'
                            className={cn(
                              'justify-center whitespace-nowrap',
                              'rounded-full px-2.5 py-1',
                              'text-xs font-semibold',
                              'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                              degreeTypeClass,
                            )}
                          >
                            {degreeTypeLabel}
                          </Badge>

                          {/* Verification status */}
                          <VerificationBadge verified={isVerified} />
                        </div>
                      </div>

                      {/* Degree actions */}
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

                    {/* =================================================
                        Academic Details

                        Institution isn't repeated here because it is
                        already displayed below the degree name.
                    ================================================= */}
                    <div className='grid content-start gap-x-6 gap-y-4 sm:grid-cols-2'>
                      <DetailItem label={ct('major')} value={degree.major} />

                      <DetailItem
                        label={ct('graduated')}
                        value={formatDate(degree.graduationDate, isRtl)}
                      />
                    </div>

                    {/* =================================================
                        Document & Verification
                    ================================================= */}
                    {employeeId && degreeId && hasCredentialMeta && (
                      <div className={cn('mt-5 space-y-4 border-t pt-4')}>
                        {/* Current document */}
                        {degree.document && (
                          <div>
                            <p
                              className={cn(
                                'mb-2 text-xs font-semibold',
                                'tracking-wide text-muted-foreground',
                              )}
                            >
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

                        {/* Verification information */}
                        {isVerified && degree.verification && (
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
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
