// enayah-frontend/src/modules/hr/employees/components/profile/tabs/cards/personal-details.tsx

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronDown, Plus, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ExpiryStatusBadge } from '@/components/badges/expiry-status-badge'
import { CurrentBadge } from '@/components/badges/current-status-badge'
import { RowActions } from '@/components/dialogs/row-actions'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { EmployeePersonalDetails } from '@/modules/hr/employees/types/employee-personal-details.types'

import { cn } from '@/lib/utils'
import { formatDate, getExpiryStatus, toPersianDigits } from '@/utils/utilities'

function dash(value?: string | number | boolean | null) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'

  return value ?? '-'
}

// function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className='min-w-0'>
//       <div className='text-xs text-muted-foreground'>{label}</div>

//       <div className='mt-0.5 break-words text-sm font-medium text-foreground'>
//         {value ?? '-'}
//       </div>
//     </div>
//   )
// }
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='min-w-0'>
      <div className='text-xs font-medium text-muted-foreground'>{label}</div>

      <div className='mt-1 break-words text-sm font-medium text-foreground'>
        {value ?? '-'}
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  message,
  addLabel,
  onAdd,
}: {
  icon: React.ReactNode
  message: string
  addLabel?: string
  onAdd?: () => void
}) {
  return (
    <div className='rounded-xl border border-dashed bg-muted/10 px-4 py-8 text-center sm:px-6 sm:py-10'>
      <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted'>
        {icon}
      </div>

      <p className='text-sm text-muted-foreground'>{message}</p>

      {onAdd && addLabel && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='mt-4'
          onClick={onAdd}
        >
          <Plus aria-hidden='true' className='me-2 h-4 w-4' />

          {addLabel}
        </Button>
      )}
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
  className,
  spanClass,
  count,
  onAdd,
  collapsible = true,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
  spanClass?: string
  count?: number
  onAdd?: () => void
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [isOpen, setIsOpen] = useState(defaultOpen)

  const displayedCount =
    count === undefined ? undefined : isRtl ? toPersianDigits(count) : count

  function toggle() {
    if (!collapsible) return

    setIsOpen((previous) => !previous)
  }

  return (
    <Card className='overflow-hidden transition-all duration-200 hover:shadow-md'>
      <CardHeader
        className={cn(
          'bg-muted/20 px-3 py-3 transition-colors duration-200',
          'sm:px-6 sm:py-4',
          (!collapsible || isOpen) && 'border-b',
        )}
      >
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4'>
          {/* Collapsible title */}
          <button
            type='button'
            onClick={toggle}
            disabled={!collapsible}
            aria-expanded={collapsible ? isOpen : undefined}
            className={cn(
              'group min-w-0 text-start',
              'rounded-md outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2',
              collapsible && 'cursor-pointer',
              !collapsible && 'cursor-default',
            )}
          >
            <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
              {/* Icon */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center',
                  'rounded-lg',
                  'sm:h-10 sm:w-10 sm:rounded-xl',
                  className,
                )}
              >
                {icon}
              </div>

              {/* Title */}
              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
                  <span
                    className={cn(
                      'min-w-0 truncate',
                      'text-sm font-semibold sm:text-base',
                      spanClass,
                    )}
                  >
                    {title}
                  </span>

                  {/* Count */}
                  {displayedCount !== undefined && (
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
                  )}

                  {/* Chevron */}
                  {collapsible && (
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
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Add */}
          {onAdd && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  onClick={onAdd}
                  aria-label={`${isRtl ? 'إضافة' : 'Add'} ${title}`}
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

              <TooltipContent side='top'>
                {isRtl ? 'إضافة' : 'Add'} {title}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>

      {(!collapsible || isOpen) && (
        <CardContent className='p-4 sm:p-5'>{children}</CardContent>
      )}
    </Card>
  )
}

interface Props {
  personalDetails?: EmployeePersonalDetails

  onAddIdentification?: () => void
  onEditIdentification?: (id: string) => void
  onDeleteIdentification?: (id: string) => void

  onAddPhone?: () => void
  onEditPhone?: (id: string) => void
  onDeletePhone?: (id: string) => void

  onAddEmail?: () => void
  onEditEmail?: (id: string) => void
  onDeleteEmail?: (id: string) => void

  onAddEmergencyContact?: () => void
  onEditEmergencyContact?: (id: string) => void
  onDeleteEmergencyContact?: (id: string) => void

  onAddDependent?: () => void
  onEditDependent?: (id: string) => void
  onDeleteDependent?: (id: string) => void

  onAddAddress?: () => void
  onEditAddress?: (id: string) => void
  onDeleteAddress?: (id: string) => void

  onAddVisa?: () => void
  onEditVisa?: (id: string) => void
  onDeleteVisa?: (id: string) => void
}

export function PersonalDetailsCards({
  personalDetails,

  onAddIdentification,
  onEditIdentification,
  onDeleteIdentification,

  onAddPhone,
  onEditPhone,
  onDeletePhone,

  onAddEmail,
  onEditEmail,
  onDeleteEmail,

  onAddEmergencyContact,
  onEditEmergencyContact,
  onDeleteEmergencyContact,

  onAddDependent,
  onEditDependent,
  onDeleteDependent,

  onAddAddress,
  onEditAddress,
  onDeleteAddress,

  onAddVisa,
  onEditVisa,
  onDeleteVisa,
}: Props) {
  const et = useTranslations('employees')
  const ct = useTranslations('common')
  const it = useTranslations('identifications')
  const pt = useTranslations('phoneNumber')
  const dt = useTranslations('dependents')
  const at = useTranslations('addresses')
  const emt = useTranslations('email')
  const ect = useTranslations('emergencyContact')
  const vt = useTranslations('visas')

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const identifications = personalDetails?.identifications ?? []
  const emails = personalDetails?.emails ?? []
  const phones = personalDetails?.phoneNumbers ?? []
  const dependents = personalDetails?.dependents ?? []
  const addresses = personalDetails?.addresses ?? []
  const emergencyContacts = personalDetails?.emergencyContacts ?? []
  const visas = personalDetails?.visas ?? []
  const identificationGridClass = cn(
    'grid grid-cols-1 items-start gap-4',
    identifications.length === 2 && 'lg:grid-cols-2',
    identifications.length === 3 && 'lg:grid-cols-2 xl:grid-cols-3',
    identifications.length >= 4 && 'lg:grid-cols-2 xl:grid-cols-4',
  )

  return (
    <div className='space-y-6'>
      {/* =========================================================
          Identification
      ========================================================= */}
      <SectionCard
        title={it('idTitle')}
        count={identifications.length}
        icon={
          <span
            className={cn(
              'inline-block text-2xl leading-none sm:text-3xl',
              !isRtl && '-scale-x-100',
            )}
          >
            📇
          </span>
        }
        className='bg-green-500/10'
        spanClass='text-green-600 dark:text-green-400'
        onAdd={onAddIdentification}
      >
        {identifications.length === 0 ? (
          <EmptyState
            icon={
              <span
                aria-hidden='true'
                className={cn(
                  'inline-block text-2xl leading-none',
                  !isRtl && '-scale-x-100',
                )}
              >
                📇
              </span>
            }
            message={it('noIdentificationRecords')}
            addLabel={it('addIdentification')}
            onAdd={onAddIdentification}
          />
        ) : (
          <div className={identificationGridClass}>
            {identifications.map((item) => {
              const status = getExpiryStatus(item.expiryDate, isRtl)

              return (
                <article
                  key={item.id}
                  className={cn(
                    'group relative flex min-w-0 flex-col overflow-hidden',
                    'rounded-xl border border-s-4 bg-card',
                    'shadow-sm transition-all duration-200',
                    'hover:shadow-md',
                    //status.bgClass,
                    status.borderClass,
                  )}
                >
                  {/* Header */}
                  <div className='border-b border-muted/50 px-4 py-4 sm:px-5'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        {/* Type + Current */}
                        <div className='flex min-w-0 flex-wrap items-center gap-2'>
                          <h3 className='truncate text-base font-semibold text-foreground'>
                            {et(item.type)}
                          </h3>

                          {item.isCurrent && (
                            <CurrentBadge label={ct('current')} />
                          )}
                        </div>

                        {/* Identification number */}
                        <div className='mt-2'>
                          <p className='text-xs text-muted-foreground'>
                            {it('number')}
                          </p>

                          <p
                            dir='ltr'
                            className={cn(
                              'mt-0.5 break-all text-base font-semibold',
                              'tracking-wide text-foreground',
                              'tabular-nums sm:text-lg',
                            )}
                          >
                            {isRtl
                              ? toPersianDigits(item.identificationNumber)
                              : item.identificationNumber}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='relative z-20 shrink-0'>
                        <RowActions
                          onEdit={() => onEditIdentification?.(item.id)}
                          onDelete={() => onDeleteIdentification?.(item.id)}
                        />
                      </div>
                    </div>

                    {/* Expiry status */}
                    <div className='mt-3'>
                      <ExpiryStatusBadge
                        expiryDate={item.expiryDate}
                        showAttentionPulse
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    className={cn(
                      'grid content-start gap-x-6 gap-y-4',
                      'px-4 py-4 sm:grid-cols-2 sm:px-5',
                      'xl:grid-cols-3',
                    )}
                  >
                    <InfoRow
                      label={it('issueDate')}
                      value={formatDate(item.issueDate, isRtl)}
                    />

                    <InfoRow
                      label={it('expiryDate')}
                      value={formatDate(item.expiryDate, isRtl)}
                    />

                    <InfoRow
                      label={it('authority')}
                      value={dash(item.issuingAuthority)}
                    />

                    {item.type === 'iqama' && (
                      <>
                        <InfoRow
                          label={it('occupation')}
                          value={dash(item.occupation)}
                        />

                        <InfoRow
                          label={it('sponsor')}
                          value={dash(
                            isRtl
                              ? toPersianDigits(item.sponsor)
                              : item.sponsor,
                          )}
                        />
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* =========================================================
          Phone + Email
      ========================================================= */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <SectionCard
          title={pt('phoneTitle')}
          count={phones.length}
          icon={<span className='text-2xl leading-none sm:text-3xl'>☎️</span>}
          className='bg-purple-500/10'
          spanClass='text-purple-500 dark:text-purple-400'
          onAdd={onAddPhone}
        >
          {phones.length === 0 ? (
            <EmptyState
              icon={
                <span
                  aria-hidden='true'
                  className={cn(
                    'inline-block text-2xl leading-none',
                    !isRtl && '-scale-x-100',
                  )}
                >
                  ☎️
                </span>
              }
              message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${pt(
                'phoneTitle',
              )}`}
              addLabel={`${isRtl ? 'إضافة' : 'Add'} ${pt('phoneTitle')}`}
              onAdd={onAddPhone}
            />
          ) : (
            <div className='space-y-4'>
              {phones.map((phone) => {
                const number = isRtl
                  ? toPersianDigits(`${phone.countryCode}${phone.phoneNumber}`)
                  : `${phone.countryCode}${phone.phoneNumber}`

                return (
                  <article
                    key={phone.id}
                    className={cn(
                      'rounded-xl border bg-card p-4',
                      'shadow-sm transition-all duration-200',
                      'hover:border-purple-500/20 hover:shadow-md',
                    )}
                  >
                    <div className='mb-4 flex items-start justify-between gap-3 border-b pb-3'>
                      <div className='min-w-0'>
                        <div className='break-all font-semibold' dir='ltr'>
                          {number}
                        </div>

                        <div className='mt-2 flex flex-wrap gap-2'>
                          {phone.isPrimary && <Badge>{pt('primary')}</Badge>}

                          {phone.isWhatsapp && (
                            <Badge variant='outline'>{pt('whatsApp')}</Badge>
                          )}
                        </div>
                      </div>

                      <div className='shrink-0'>
                        <RowActions
                          onEdit={() => onEditPhone?.(phone.id)}
                          onDelete={() => onDeletePhone?.(phone.id)}
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <InfoRow label={pt('type')} value={pt(phone.type)} />

                      <InfoRow
                        label={pt('extension')}
                        value={dash(phone.extension)}
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={emt('emailTitle')}
          count={emails.length}
          icon={
            <span
              className={cn(
                'inline-block text-2xl leading-none sm:text-3xl',
                !isRtl && '-scale-x-100',
              )}
            >
              📬
            </span>
          }
          className='bg-teal-500/10'
          spanClass='text-teal-600 dark:text-teal-400'
          onAdd={onAddEmail}
        >
          {emails.length === 0 ? (
            <EmptyState
              icon={
                <span
                  aria-hidden='true'
                  className={cn(
                    'inline-block text-2xl leading-none',
                    !isRtl && '-scale-x-100',
                  )}
                >
                  📬
                </span>
              }
              message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${emt(
                'emailTitle',
              )}`}
              addLabel={`${isRtl ? 'إضافة' : 'Add'} ${emt('emailTitle')}`}
              onAdd={onAddEmail}
            />
          ) : (
            <div className='space-y-4'>
              {emails.map((email) => (
                <article
                  key={email.id}
                  className={cn(
                    'rounded-xl border bg-card p-4',
                    'shadow-sm transition-all duration-200',
                    'hover:border-teal-500/20 hover:shadow-md',
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                      <div className='break-all font-semibold' dir='ltr'>
                        {email.email}
                      </div>

                      <div className='mt-1 text-sm capitalize text-muted-foreground'>
                        {emt(email.type)}
                      </div>

                      {email.isPrimary && (
                        <div className='mt-2'>
                          <Badge>{emt('primary')}</Badge>
                        </div>
                      )}
                    </div>

                    <div className='shrink-0'>
                      <RowActions
                        onEdit={() => onEditEmail?.(email.id)}
                        onDelete={() => onDeleteEmail?.(email.id)}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* =========================================================
          Emergency Contacts
      ========================================================= */}
      <SectionCard
        title={ect('emergencyContactTitle')}
        count={emergencyContacts.length}
        icon={<span className='text-2xl leading-none sm:text-3xl'>🚨</span>}
        className='bg-red-500/10'
        spanClass='text-red-600 dark:text-red-400'
        onAdd={onAddEmergencyContact}
      >
        {emergencyContacts.length === 0 ? (
          <EmptyState
            icon={
              <span
                aria-hidden='true'
                className={cn(
                  'inline-block text-2xl leading-none',
                  !isRtl && '-scale-x-100',
                )}
              >
                🚨
              </span>
            }
            message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${ect(
              'emergencyContactTitle',
            )}`}
            addLabel={`${isRtl ? 'إضافة' : 'Add'} ${ect('emergencyContactTitle')}`}
            onAdd={onAddEmergencyContact}
          />
        ) : (
          <div
            className={cn(
              'grid gap-4',
              emergencyContacts.length > 1 && 'xl:grid-cols-2',
            )}
          >
            {emergencyContacts.map((contact) => (
              <article
                key={contact.id}
                className={cn(
                  'group relative overflow-hidden rounded-xl border bg-card',
                  'shadow-sm transition-all duration-200',
                  'hover:border-red-500/30 hover:shadow-md',
                )}
              >
                {/* Header */}
                <div className='relative border-b bg-muted/20 px-4 py-3'>
                  <div className='pe-10'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='break-words font-semibold text-foreground'>
                        {contact.name}
                      </h3>

                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1',
                          'bg-red-500/10',
                          'text-xs font-medium text-red-600',
                          'dark:text-red-400',
                        )}
                      >
                        {ect(contact.relationship)}
                      </span>
                    </div>
                  </div>

                  <div className='absolute end-3 top-1/2 -translate-y-1/2'>
                    <RowActions
                      onEdit={() => onEditEmergencyContact?.(contact.id)}
                      onDelete={() => onDeleteEmergencyContact?.(contact.id)}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className='grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2'>
                  <InfoRow
                    label={ect('phoneNumber')}
                    value={
                      isRtl
                        ? dash(toPersianDigits(contact.mobile))
                        : dash(contact.mobile)
                    }
                  />

                  <InfoRow
                    label={ect('alternateMobile')}
                    value={
                      isRtl
                        ? dash(toPersianDigits(contact.alternateMobile))
                        : dash(contact.alternateMobile)
                    }
                  />

                  <div className='sm:col-span-2'>
                    <InfoRow
                      label={ect('address')}
                      value={dash(contact.address)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {/* =========================================================
          Dependents
      ========================================================= */}
      <SectionCard
        title={dt('dependentsTitle')}
        count={dependents.length}
        icon={<Users className='h-4 w-4 text-sky-500 sm:h-5 sm:w-5' />}
        className='bg-sky-500/10'
        spanClass='text-sky-500 dark:text-sky-400'
        onAdd={onAddDependent}
      >
        {dependents.length === 0 ? (
          <EmptyState
            icon={
              <span
                aria-hidden='true'
                className={cn(
                  'inline-block text-2xl leading-none',
                  !isRtl && '-scale-x-100',
                )}
              >
                <Users className='h-4 w-4 text-sky-500 sm:h-5 sm:w-5' />
              </span>
            }
            message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${dt(
              'dependentsTitle',
            )}`}
            addLabel={`${isRtl ? 'إضافة' : 'Add'} ${dt('dependentsTitle')}`}
            onAdd={onAddDependent}
          />
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {dependents.map((dep) => {
              const dependentName = isRtl
                ? [
                    dep.firstNameAr,
                    dep.secondNameAr,
                    dep.thirdNameAr,
                    dep.familyNameAr,
                  ]
                    .filter(Boolean)
                    .join(' ')
                : [
                    dep.firstNameEn,
                    dep.secondNameEn,
                    dep.thirdNameEn,
                    dep.familyNameEn,
                  ]
                    .filter(Boolean)
                    .join(' ')

              return (
                <article
                  key={dep.id}
                  className={cn(
                    'rounded-xl border bg-card p-4',
                    'shadow-sm transition-all duration-200',
                    'hover:border-sky-500/20 hover:shadow-md',
                  )}
                >
                  <div className='mb-4 flex items-start justify-between gap-3 border-b pb-3'>
                    <h3 className='min-w-0 break-words font-semibold'>
                      {dependentName || '-'}
                    </h3>

                    <div className='shrink-0'>
                      <RowActions
                        onEdit={() => onEditDependent?.(dep.id)}
                        onDelete={() => onDeleteDependent?.(dep.id)}
                      />
                    </div>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <InfoRow
                      label={dt('relationship')}
                      value={dt(dep.relationship)}
                    />

                    <InfoRow label={dt('gender')} value={et(dep.gender)} />

                    <InfoRow
                      label={dt('dateOfBirth')}
                      value={formatDate(dep.dateOfBirth, isRtl)}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* =========================================================
          Address + Visa
      ========================================================= */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <SectionCard
          title={at('addressesTitle')}
          count={addresses.length}
          icon={<span className='text-2xl leading-none sm:text-3xl'>🗺️</span>}
          className='bg-pink-500/10'
          spanClass='text-pink-500 dark:text-pink-400'
          onAdd={onAddAddress}
        >
          {addresses.length === 0 ? (
            <EmptyState
              icon={
                <span
                  aria-hidden='true'
                  className={cn(
                    'inline-block text-2xl leading-none',
                    !isRtl && '-scale-x-100',
                  )}
                >
                  🗺️
                </span>
              }
              message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${at(
                'addressesTitle',
              )}`}
              addLabel={`${isRtl ? 'إضافة' : 'Add'} ${at('addressesTitle')}`}
              onAdd={onAddAddress}
            />
          ) : (
            <div className='space-y-4'>
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className={cn(
                    'relative rounded-xl border bg-card p-4',
                    'shadow-sm transition-all duration-200',
                    'hover:border-pink-500/20 hover:shadow-md',
                  )}
                >
                  <div className='absolute end-3 top-3 z-10'>
                    <RowActions
                      onEdit={() => onEditAddress?.(address.id)}
                      onDelete={() => onDeleteAddress?.(address.id)}
                    />
                  </div>

                  <div className='mb-4 border-b pb-3 pe-10'>
                    <h3 className='font-semibold capitalize'>
                      {address.addressType}
                    </h3>

                    <p className='mt-2 break-words text-sm leading-6 text-muted-foreground'>
                      {[
                        address.building && `Building ${address.building}`,
                        address.street,
                        address.district,
                        address.city,
                        address.stateProvince,
                        address.country?.name,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <InfoRow
                      label={at('postalCode')}
                      value={dash(address.postalCode)}
                    />

                    <InfoRow
                      label={at('additionalNumber')}
                      value={dash(address.additionalNumber)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={vt('visasTitle')}
          count={visas.length}
          icon={
            <span
              className={cn(
                'inline-block text-2xl leading-none sm:text-3xl',
                isRtl && '-scale-x-100',
              )}
            >
              🛫
            </span>
          }
          className='bg-sky-500/10'
          spanClass='text-sky-500 dark:text-sky-400'
          onAdd={onAddVisa}
        >
          {visas.length === 0 ? (
            <EmptyState
              icon={
                <span
                  aria-hidden='true'
                  className={cn(
                    'inline-block text-2xl leading-none',
                    !isRtl && '-scale-x-100',
                  )}
                >
                  🛫
                </span>
              }
              message={`${isRtl ? 'لا توجد سجلات' : 'No records found'} — ${vt(
                'visasTitle',
              )}`}
              addLabel={`${isRtl ? 'إضافة' : 'Add'} ${vt('visasTitle')}`}
              onAdd={onAddVisa}
            />
          ) : (
            <div className='space-y-4'>
              {visas.map((visa) => (
                <article
                  key={visa.id}
                  className={cn(
                    'relative rounded-xl border bg-card p-4',
                    'shadow-sm transition-all duration-200',
                    'hover:border-sky-500/20 hover:shadow-md',
                  )}
                >
                  <div className='absolute end-3 top-3 z-10'>
                    <RowActions
                      onEdit={() => onEditVisa?.(visa.id)}
                      onDelete={() => onDeleteVisa?.(visa.id)}
                    />
                  </div>

                  <div className='mb-4 flex min-w-0 items-center gap-2 border-b pb-3 pe-10'>
                    <h3 className='min-w-0 break-all font-semibold' dir='ltr'>
                      {isRtl
                        ? toPersianDigits(visa.visaNumber)
                        : visa.visaNumber}
                    </h3>

                    {visa.isCurrent && <CurrentBadge label={ct('current')} />}
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <InfoRow
                      label={vt('visaType')}
                      value={dash(visa.visaType)}
                    />

                    <InfoRow
                      label={vt('issueDate')}
                      value={formatDate(visa.issueDate, isRtl)}
                    />

                    <InfoRow
                      label={vt('expiryDate')}
                      value={formatDate(visa.expiryDate, isRtl)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
