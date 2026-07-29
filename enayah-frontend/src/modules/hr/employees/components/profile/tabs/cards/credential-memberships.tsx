// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/credential-memberships.tsx

'use client'

import type { ReactNode } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Handshake, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/badges/verification-badge'
import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import { MembershipInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { formatDate, toPersianDigits } from '@/utils/utilities'
import { DetailItem } from '@/components/forms/form-detail-item'

interface Props {
  memberships: MembershipInput[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatMembershipLevel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function CredentialMemberships({
  memberships,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const locale = useLocale()
  const ct = useTranslations('credentials')
  const isRtl = locale === 'ar'

  const displayedCount = isRtl
    ? toPersianDigits(memberships.length)
    : memberships.length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex min-w-0 items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10'>
              <Handshake
                aria-hidden='true'
                className='h-5 w-5 text-cyan-600 dark:text-cyan-400'
              />
            </div>

            <div className='flex min-w-0 items-center gap-2'>
              <span className='truncate text-base font-semibold'>
                {ct('memberLabel')}
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
              {ct('addMember')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>
        {memberships.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
              <Handshake
                aria-hidden='true'
                className='h-5 w-5 text-muted-foreground'
              />
            </div>

            <p className='text-sm text-muted-foreground'>
              {ct('noRecFound', {
                item: ct('memberLabel'),
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
                {ct('addMember')}
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {memberships.map((membership, index) => {
              const membershipId = membership.id

              const displayedMembershipNumber =
                membership.membershipNumber && isRtl
                  ? toPersianDigits(membership.membershipNumber)
                  : membership.membershipNumber

              const membershipLevelLabel =
                membership.membershipLevel &&
                (ct.has(membership.membershipLevel)
                  ? ct(membership.membershipLevel)
                  : formatMembershipLevel(membership.membershipLevel))

              return (
                <article
                  key={
                    membershipId ??
                    `${membership.organization}-${membership.membershipNumber ?? index}`
                  }
                  className='relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5'
                >
                  <div className='mb-5 flex items-start justify-between gap-4 border-b pb-4'>
                    <div className='min-w-0'>
                      <h3 className='break-words text-base font-semibold text-foreground'>
                        {membership.organization || '-'}
                      </h3>

                      {membership.membershipNumber && (
                        <p
                          className='mt-1 break-all text-sm text-muted-foreground'
                          dir='ltr'
                        >
                          {displayedMembershipNumber}
                        </p>
                      )}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        <VerificationBadge
                          verified={membership.isVerified ?? false}
                        />

                        {membershipLevelLabel && (
                          <Badge
                            variant='outline'
                            className='rounded-full border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300'
                          >
                            {membershipLevelLabel}
                          </Badge>
                        )}

                        <ExpiryStatusBadge
                          expiryDate={membership.expiryDate}
                          showAttentionPulse
                        />
                      </div>
                    </div>

                    <div className='relative z-20 shrink-0'>
                      <RowActions
                        onEdit={
                          membershipId && onEdit
                            ? () => onEdit(membershipId)
                            : undefined
                        }
                        onDelete={
                          membershipId && onDelete
                            ? () => onDelete(membershipId)
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
                    <DetailItem
                      label={ct('membershipNumber')}
                      value={displayedMembershipNumber}
                      valueDirection='ltr'
                    />

                    <DetailItem
                      label={ct('issued')}
                      value={formatDate(membership.startDate, isRtl)}
                    />

                    <DetailItem
                      label={ct('expires')}
                      value={formatDate(membership.expiryDate, isRtl)}
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
