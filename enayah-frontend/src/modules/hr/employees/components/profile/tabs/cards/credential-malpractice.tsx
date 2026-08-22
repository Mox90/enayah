// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-malpractice.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, Plus, ShieldCheck } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { DetailItem } from '@/components/forms/form-detail-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { malpracticeDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { MalpracticeInput } from '@/modules/hr/onboarding/types/onboarding.types'

import { cn } from '@/lib/utils'
import { formatDate, toPersianDigits } from '@/utils/utilities'

interface Props {
  malpractice: MalpracticeInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
}

function formatCoverageAmount(
  value: string | number | null | undefined,
  isRtl: boolean,
) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const formattedValue =
    typeof value === 'number'
      ? new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 2,
        }).format(value)
      : value

  return isRtl ? toPersianDigits(String(formattedValue)) : formattedValue
}

export function CredentialMalpractice({
  malpractice,
  employeeId,
  onAdd,
  onEdit,
  onDelete,
  onVerify,
}: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'

  const [isOpen, setIsOpen] = useState(false)

  const displayedCount = isRtl
    ? toPersianDigits(malpractice.length)
    : malpractice.length

  return (
    <Card className='overflow-hidden transition-all duration-200 hover:shadow-md'>
      {/* =========================================================
          Header
      ========================================================= */}
      <CardHeader
        className={cn(
          'bg-muted/20 px-3 py-3 transition-colors duration-200',
          'sm:px-6 sm:py-4',
          isOpen && 'border-b',
        )}
      >
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4'>
          {/* Collapsible title area */}
          <button
            type='button'
            onClick={() => setIsOpen((previous) => !previous)}
            aria-expanded={isOpen}
            aria-controls='credential-malpractice-content'
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
                  'flex h-9 w-9 shrink-0 items-center justify-center',
                  'rounded-lg bg-indigo-500/10',
                  'sm:h-10 sm:w-10 sm:rounded-xl',
                )}
              >
                <ShieldCheck
                  aria-hidden='true'
                  className={cn(
                    'h-4 w-4 text-indigo-600',
                    'sm:h-5 sm:w-5',
                    'dark:text-indigo-400',
                  )}
                />
              </div>

              {/* Title + subtitle */}
              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
                  <span className='min-w-0 truncate text-sm font-semibold text-foreground sm:text-base'>
                    {ct('malpracticeLabel')}
                  </span>

                  {/* Count */}
                  <span
                    className={cn(
                      'inline-flex min-w-5 shrink-0 items-center justify-center',
                      'rounded-full bg-muted px-1.5 py-0.5',
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

                {/* <p className='mt-1 line-clamp-1 text-[11px] leading-4 text-muted-foreground sm:text-sm'>
                  {ct('malpracticeDetailSub')}
                </p> */}
              </div>
            </div>
          </button>

          {/* Add malpractice */}
          {onAdd && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  onClick={onAdd}
                  aria-label={ct('addMalpractice')}
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

              <TooltipContent side='top'>{ct('addMalpractice')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>

      {/* =========================================================
          Content
      ========================================================= */}
      {isOpen && (
        <CardContent id='credential-malpractice-content' className='p-4 sm:p-5'>
          {malpractice.length === 0 ? (
            /* =====================================================
                Empty State
            ===================================================== */
            <div className='rounded-xl border border-dashed bg-muted/10 px-4 py-8 text-center sm:px-6 sm:py-10'>
              <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
                <ShieldCheck
                  aria-hidden='true'
                  className='h-5 w-5 text-muted-foreground'
                />
              </div>

              <p className='text-sm text-muted-foreground'>
                {ct('noRecFound', {
                  item: ct('malpracticeLabel'),
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

                  {ct('addMalpractice')}
                </Button>
              )}
            </div>
          ) : (
            /* =====================================================
                Malpractice Grid
            ===================================================== */
            <div
              className={cn(
                'grid grid-cols-1 items-start gap-4',

                malpractice.length === 2 && 'lg:grid-cols-2',

                malpractice.length === 3 && 'lg:grid-cols-2 xl:grid-cols-3',

                malpractice.length >= 4 &&
                  'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
              )}
            >
              {malpractice.map((insurance, index) => {
                const insuranceId = insurance.id

                const displayedPolicyNumber =
                  insurance.policyNumber && isRtl
                    ? toPersianDigits(insurance.policyNumber)
                    : insurance.policyNumber

                const isVerified =
                  insurance.verification?.isVerified ??
                  insurance.isVerified ??
                  false

                return (
                  <article
                    key={
                      insuranceId ??
                      `${insurance.insuranceCompany}-${insurance.policyNumber}-${index}`
                    }
                    className={cn(
                      'group/credential relative flex min-w-0 flex-col overflow-hidden',
                      'rounded-xl border bg-card',
                      'p-4 shadow-sm sm:p-5',
                      'transition-all duration-200',
                      'hover:border-primary/20 hover:shadow-md',

                      // isVerified &&
                      //   'border-emerald-500/30 dark:border-emerald-500/25',
                    )}
                  >
                    {/* Verified accent */}
                    {/* {isVerified && (
                      <div
                        aria-hidden='true'
                        className='absolute inset-y-0 start-0 w-1 bg-emerald-500'
                      />
                    )} */}

                    {/* =================================================
                        Malpractice Header
                    ================================================= */}
                    <div className='mb-4 flex items-start justify-between gap-3 border-b pb-3 sm:gap-4'>
                      <div className='min-w-0 flex-1'>
                        {/* Insurance company */}
                        <h3 className='break-words text-base font-semibold leading-snug text-foreground'>
                          {insurance.insuranceCompany || '-'}
                        </h3>

                        {/* Policy Number */}
                        {insurance.policyNumber && (
                          <p
                            className='mt-1 break-all text-sm leading-relaxed text-muted-foreground'
                            dir='ltr'
                          >
                            {displayedPolicyNumber}
                          </p>
                        )}

                        {/* Statuses */}
                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                          {/* <VerificationBadge verified={isVerified} /> */}

                          {insurance.expiryDate && (
                            <ExpiryStatusBadge
                              expiryDate={insurance.expiryDate}
                              pulseOnParentHover
                              pulseOnInView
                            />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='relative z-20 shrink-0'>
                        <RowActions
                          onEdit={
                            insuranceId && onEdit
                              ? () => onEdit(insuranceId)
                              : undefined
                          }
                          onDelete={
                            insuranceId && onDelete
                              ? () => onDelete(insuranceId)
                              : undefined
                          }
                          onVerify={
                            insuranceId && onVerify
                              ? () => onVerify(insuranceId)
                              : undefined
                          }
                          confirmDelete
                          deleteItemName={ct('malpractice')}
                        />
                      </div>
                    </div>

                    {/* =================================================
                        Malpractice Details
                    ================================================= */}
                    <div
                      className={cn(
                        'grid content-start gap-x-6 gap-y-4',
                        'sm:grid-cols-2',
                        'xl:grid-cols-3',
                      )}
                    >
                      <DetailItem
                        label={ct('amount')}
                        value={formatCoverageAmount(
                          insurance.coverageAmount,
                          isRtl,
                        )}
                        valueDirection='ltr'
                      />

                      <DetailItem
                        label={ct('startDate')}
                        value={formatDate(insurance.startDate, isRtl)}
                      />

                      <DetailItem
                        label={ct('expires')}
                        value={formatDate(insurance.expiryDate, isRtl)}
                      />
                    </div>

                    {/* =================================================
                        Credential Document
                    ================================================= */}
                    {employeeId && insuranceId && insurance.document && (
                      <div className='mt-5 border-t pt-4'>
                        <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground'>
                          {ct('malpracticeDocument.currentTitle')}
                        </p>

                        <CredentialDocumentSummary
                          employeeId={employeeId}
                          credentialId={insuranceId}
                          document={insurance.document}
                          service={malpracticeDocumentService}
                        />
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
