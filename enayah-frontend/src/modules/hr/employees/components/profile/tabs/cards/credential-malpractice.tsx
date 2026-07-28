// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-malpractice.tsx

'use client'

import type { ReactNode } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Plus, ShieldCheck } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { MalpracticeInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { toPersianDigits } from '@/utils/utilities'

interface Props {
  malpractice: MalpracticeInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

interface DetailItemProps {
  label: string
  value?: ReactNode
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
        {value === null || value === undefined || value === '' ? '-' : value}
      </div>
    </div>
  )
}

function formatMalpracticeDate(
  value: string | null | undefined,
  isRtl: boolean,
) {
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
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'

  const displayedCount = isRtl
    ? toPersianDigits(malpractice.length)
    : malpractice.length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex min-w-0 items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10'>
              <ShieldCheck
                aria-hidden='true'
                className='h-5 w-5 text-indigo-600 dark:text-indigo-400'
              />
            </div>

            <div className='flex min-w-0 items-center gap-2'>
              <span className='truncate text-base font-semibold'>
                {ct('malpracticeLabel')}
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
              className='w-full shrink-0 sm:w-auto'
            >
              <Plus aria-hidden='true' className='me-2 h-4 w-4' />

              {ct('addMalpractice')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {malpractice.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
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
          <div className='space-y-4'>
            {malpractice.map((insurance, index) => {
              const insuranceId = insurance.id

              const displayedPolicyNumber =
                insurance.policyNumber && isRtl
                  ? toPersianDigits(insurance.policyNumber)
                  : insurance.policyNumber

              return (
                <article
                  key={
                    insuranceId ??
                    `${insurance.insuranceCompany}-${insurance.policyNumber}-${index}`
                  }
                  className='group/credential relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
                >
                  <div className='mb-5 flex items-start justify-between gap-4 border-b pb-4'>
                    <div className='min-w-0'>
                      <h3 className='break-words text-base font-semibold text-foreground'>
                        {insurance.insuranceCompany || '-'}
                      </h3>

                      {insurance.policyNumber && (
                        <p
                          className='mt-1 break-all text-sm text-muted-foreground'
                          dir='ltr'
                        >
                          {displayedPolicyNumber}
                        </p>
                      )}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <VerificationBadge
                          verified={insurance.isVerified ?? false}
                        />

                        <ExpiryStatusBadge
                          expiryDate={insurance.expiryDate}
                          pulseOnParentHover
                          pulseOnInView
                        />
                      </div>
                    </div>

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
                      />
                    </div>
                  </div>

                  <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
                    <DetailItem
                      label={ct('policyNum')}
                      value={displayedPolicyNumber}
                      valueDirection='ltr'
                    />

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
                      value={formatMalpracticeDate(insurance.startDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatMalpracticeDate(insurance.expiryDate, isRtl)}
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
