// enayah-frontendsrc/modules/hr/employees/components/profile/tabs/cards/credential-life-support.tsx

'use client'

import { HeartPulse, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { LifeSupportInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { formatDate, toPersianDigits } from '@/utils/utilities'
import { DetailItem } from '@/components/forms/form-detail-item'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { lifeSupportDocumentService } from '@/modules/hr/credentials/services/credential-document.service'

interface Props {
  lifeSupports: LifeSupportInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
}

const translatableCredentialValues = new Set([
  'aha',
  'sha',
  'bls',
  'acls',
  'pals',
  'atls',
  'stls',
  'nrp',
  'itls',
  'blso',
  'atcn',
  'also',
  'tncc',
  'enpc',
  'asls',
  'esls',
  'pfccs',
  'other',
])

export function CredentialLifeSupport({
  lifeSupports,
  employeeId,
  onAdd,
  onEdit,
  onDelete,
  onVerify,
}: Props) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const displayedCount = isRtl
    ? toPersianDigits(lifeSupports.length)
    : lifeSupports.length

  function translateCredentialValue(value?: string | null) {
    if (!value) return '-'

    if (!translatableCredentialValues.has(value)) {
      return value
    }

    return t(value).replace(/\s*\([^)]+\)$/, '')
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex min-w-0 items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10'>
              <HeartPulse
                aria-hidden='true'
                className='h-5 w-5 text-rose-600 dark:text-rose-400'
              />
            </div>

            <div className='flex min-w-0 items-center gap-2'>
              <span className='truncate text-base font-semibold'>
                {t('lifeSupportLabel')}
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

              {t('addLifeSupport')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {lifeSupports.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
              <HeartPulse
                aria-hidden='true'
                className='h-5 w-5 text-muted-foreground'
              />
            </div>

            <p className='text-sm text-muted-foreground'>
              {t('noRecFound', {
                item: t('lifeSupportLabel'),
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

                {t('addLifeSupport')}
              </Button>
            )}
          </div>
        ) : (
          <div
            //className='space-y-4'
            className={cn(
              //'grid grid-cols-1 auto-rows-fr items-stretch gap-4',
              'grid grid-cols-1 items-start gap-4',
              lifeSupports.length === 2 && 'lg:grid-cols-2',
              lifeSupports.length === 3 && 'lg:grid-cols-2 xl:grid-cols-3',
              lifeSupports.length >= 4 &&
                'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
            )}
          >
            {lifeSupports.map((lifeSupport, index) => {
              const lifeSupportId = lifeSupport.id

              const displayedCertificateNumber =
                lifeSupport.certificateNumber && isRtl
                  ? toPersianDigits(lifeSupport.certificateNumber)
                  : lifeSupport.certificateNumber

              const isVerified =
                lifeSupport.verification?.isVerified ??
                lifeSupport.isVerified ??
                false

              return (
                <article
                  key={
                    lifeSupportId ??
                    `${lifeSupport.type}-${lifeSupport.certificateNumber ?? index}`
                  }
                  //className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
                  className={cn(
                    'relative flex min-w-0 flex-col rounded-xl border bg-card',
                    'p-4 shadow-sm transition-all duration-200 sm:p-5',
                    'hover:border-primary/20 hover:shadow-md',
                    //isVerified &&
                    'border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.04)]',
                  )}
                >
                  <div className='mb-5 flex items-start justify-between gap-4 border-b pb-4'>
                    <div className='min-w-0'>
                      <h3 className='break-words text-base font-semibold text-foreground'>
                        {translateCredentialValue(lifeSupport.type)}
                      </h3>

                      <p className='mt-1 break-words text-sm text-muted-foreground'>
                        {translateCredentialValue(lifeSupport.provider)}
                      </p>

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        {/* <VerificationBadge
                          verified={lifeSupport.isVerified ?? false}
                        /> */}

                        <ExpiryStatusBadge
                          expiryDate={lifeSupport.expiryDate}
                          showAttentionPulse
                        />
                      </div>
                    </div>

                    <div className='relative z-20 shrink-0'>
                      <RowActions
                        onEdit={
                          lifeSupportId && onEdit
                            ? () => onEdit(lifeSupportId)
                            : undefined
                        }
                        onDelete={
                          lifeSupportId && onDelete
                            ? () => onDelete(lifeSupportId)
                            : undefined
                        }
                        confirmDelete
                        deleteItemName={t('lifeSupport')}
                      />
                    </div>
                  </div>

                  <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
                    <DetailItem
                      label={t('certificateNum')}
                      value={displayedCertificateNumber}
                      valueDirection='ltr'
                    />

                    <DetailItem
                      label={t('issued')}
                      value={formatDate(lifeSupport.issueDate, isRtl)}
                    />

                    <DetailItem
                      label={t('expires')}
                      value={formatDate(lifeSupport.expiryDate, isRtl)}
                    />
                  </div>
                  {employeeId && lifeSupportId && lifeSupport.document && (
                    <div className='mt-5 border-t pt-4'>
                      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {t('lifeSupportDocument.currentTitle')}
                      </p>

                      <CredentialDocumentSummary
                        employeeId={employeeId}
                        credentialId={lifeSupportId}
                        document={lifeSupport.document}
                        service={lifeSupportDocumentService}
                      />
                    </div>
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
