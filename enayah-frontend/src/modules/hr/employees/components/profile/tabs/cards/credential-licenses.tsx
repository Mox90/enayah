'use client'

import { format, isValid, parseISO } from 'date-fns'
import { FileBadge2, Plus } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { StatusBadge } from '@/components/badges/status-badge'
import { LicenseInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/utils/utilities'
import { RowActions } from '@/components/dialogs/row-actions'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { arSA, enUS } from 'date-fns/locale'

// interface Props {
//   licenses: LicenseInput[]
//   onAdd?: () => void
//   onEdit?: (id: string) => void
//   onDelete?: (id: string) => void
// }

// export function CredentialLicenses({
//   licenses,
//   onAdd,
//   onEdit,
//   onDelete,
// }: Props) {
//   const ct = useTranslations('credentials')
//   const locale = useLocale()
//   const isRtl = locale === 'ar'
//   return (
//     <Card>
//       <CardHeader className='flex flex-row justify-between'>
//         <CardTitle>
//           📄 {ct('licenseLabel')} (
//           {isRtl ? toPersianDigits(licenses.length) : licenses.length})
//         </CardTitle>

//         <Button size='sm' onClick={onAdd}>
//           <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
//           {ct('addLicense')}
//         </Button>
//       </CardHeader>

//       <CardContent className='space-y-4'>
//         {licenses.length === 0 && (
//           <div className='text-muted-foreground'>
//             {ct('noRecFound', { item: isRtl ? 'التراخيص' : 'License' })}
//           </div>
//         )}

//         {licenses.map((x) => {
//           const xId = x.id
//           return (
//             <div key={x.id} className='border rounded-lg p-4'>
//               <div className='flex justify-between'>
//                 <div>
//                   <div className='font-semibold'>{x.profession}</div>
//                   <div>
//                     {ct('issuingAuthority')}: {x.authority}
//                   </div>
//                   <div>
//                     {ct('licenseNum')}: {x.licenseNumber}
//                   </div>
//                   {x.specialty && (
//                     <div>
//                       {ct('specialty')}: {x.specialty}
//                     </div>
//                   )}
//                   {x.issueDate && (
//                     <div>
//                       {ct('issued')}:{' '}
//                       {format(new Date(x.issueDate), 'dd-MMM-yyyy')}
//                     </div>
//                   )}
//                   {x.expiryDate && (
//                     <div>
//                       {ct('expires')}:{' '}
//                       {format(new Date(x.expiryDate), 'dd-MMM-yyyy')}
//                     </div>
//                   )}
//                   <VerificationBadge verified={x.isVerified ?? false} />{' '}
//                   {/* <StatusBadge status={x.status} /> */}
//                   {x.expiryDate && (
//                     <ExpiryStatusBadge
//                       expiryDate={x.expiryDate}
//                       showAttentionPulse
//                     />
//                   )}
//                 </div>

//                 <RowActions
//                   onEdit={xId && onEdit ? () => onEdit(xId) : undefined}
//                   onDelete={xId && onDelete ? () => onDelete(xId) : undefined}
//                 />
//               </div>
//             </div>
//           )
//         })}
//       </CardContent>
//     </Card>
//   )
// }

interface Props {
  licenses: LicenseInput[]
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

function formatLicenseDate(value: string | null | undefined, isRtl: boolean) {
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

export function CredentialLicenses({
  licenses,
  onAdd,
  onEdit,
  onDelete,
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

              return (
                <article
                  key={licenseId ?? `${license.licenseNumber}-${index}`}
                  className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
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
                        <VerificationBadge
                          verified={license.isVerified ?? false}
                        />

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
                      value={formatLicenseDate(license.issueDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatLicenseDate(license.expiryDate, isRtl)}
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
