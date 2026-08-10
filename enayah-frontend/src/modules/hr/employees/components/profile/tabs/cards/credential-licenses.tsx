'use client'

import { FileBadge2, Plus } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { LicenseInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { formatDate, toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { DetailItem } from '@/components/forms/form-detail-item'
import { cn } from '@/lib/utils'
import { CredentialDocumentSummary } from '@/modules/hr/credentials/components/credential-document-summary'
import { licenseDocumentService } from '@/modules/hr/credentials/services/credential-document.service'
import { CredentialVerificationSummary } from '@/modules/hr/credentials/components/credential-verification-summary'
import { licenseVerificationService } from '@/modules/hr/credentials/services/credential-verification.service'

interface Props {
  licenses: LicenseInput[]
  employeeId?: string
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onVerify?: (id: string) => void
}

export function CredentialLicenses({
  licenses,
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
    ? toPersianDigits(licenses.length)
    : licenses.length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10'>
              <FileBadge2
                aria-hidden='true'
                className='h-5 w-5 text-blue-600 dark:text-blue-400'
              />
              {/* 📄 */}
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-base font-semibold'>
                {ct('licenseLabel')}
              </span>

              <span className='inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'>
                {displayedCount}
              </span>
            </div>
          </CardTitle>

          {onAdd && (
            <Button size='sm' onClick={onAdd} className='w-full sm:w-auto'>
              <Plus aria-hidden='true' className='me-2 h-4 w-4' />
              {ct('addLicense')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {licenses.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
              <FileBadge2
                aria-hidden='true'
                className='h-5 w-5 text-muted-foreground'
              />
            </div>

            <p className='text-sm text-muted-foreground'>
              {ct('noRecFound', {
                item: ct('licenseLabel'),
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
                {ct('addLicense')}
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {licenses.map((license, index) => {
              const licenseId = license.id

              const displayedLicenseNumber = isRtl
                ? toPersianDigits(license.licenseNumber)
                : license.licenseNumber

              const isVerified =
                license.verification?.isVerified ?? license.isVerified ?? false

              return (
                <article
                  key={licenseId ?? `${license.licenseNumber}-${index}`}
                  //className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
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
                      <h3 className='truncate text-base font-semibold text-foreground'>
                        {license.profession || '-'}
                      </h3>

                      {license.specialty && (
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {license.specialty}
                        </p>
                      )}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <VerificationBadge verified={isVerified} />

                        <ExpiryStatusBadge
                          expiryDate={license.expiryDate}
                          showAttentionPulse
                        />
                      </div>
                    </div>

                    <div className='relative z-20 shrink-0'>
                      <RowActions
                        onEdit={
                          licenseId && onEdit
                            ? () => onEdit(licenseId)
                            : undefined
                        }
                        onDelete={
                          licenseId && onDelete
                            ? () => onDelete(licenseId)
                            : undefined
                        }
                        onVerify={
                          licenseId && onVerify
                            ? () => onVerify(licenseId)
                            : undefined
                        }
                        confirmDelete
                        deleteItemName={ct('license')}
                      />
                    </div>
                  </div>

                  <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
                    <DetailItem
                      label={ct('issuingAuthority')}
                      value={license.authority}
                    />

                    <DetailItem
                      label={ct('licenseNum')}
                      value={displayedLicenseNumber}
                      valueDirection='ltr'
                    />

                    {license.specialty && (
                      <DetailItem
                        label={ct('specialty')}
                        value={license.specialty}
                      />
                    )}

                    <DetailItem
                      label={ct('issued')}
                      value={formatDate(license.issueDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatDate(license.expiryDate, isRtl)}
                    />
                  </div>
                  {employeeId && licenseId && license.document && (
                    <div className='mt-5 border-t pt-4'>
                      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {ct('credentialDocument.currentTitle')}
                      </p>

                      <CredentialDocumentSummary
                        employeeId={employeeId}
                        credentialId={licenseId}
                        document={license.document}
                        service={licenseDocumentService}
                      />
                    </div>
                  )}
                  {employeeId &&
                    licenseId &&
                    isVerified &&
                    license.verification && (
                      <CredentialVerificationSummary
                        employeeId={employeeId}
                        credentialId={licenseId}
                        verification={license.verification}
                        service={licenseVerificationService}
                        {...(onVerify
                          ? { onManage: () => onVerify(licenseId) }
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
