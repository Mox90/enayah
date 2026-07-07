'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Mail,
  Phone,
  IdCard,
  Users,
  MapPin,
  Siren,
  Plane,
  Plus,
  Pencil,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { getExpiryStatus, toArabic, toPersianDigits } from '@/utils/utilities'
import { EmployeePersonalDetails } from '@/modules/hr/employees/types/employee-personal-details.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

function dash(value?: string | number | boolean | null) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return value ?? '-'
}

function formatDate(value?: string | null, isRtl?: boolean) {
  if (!value) return '-'
  return isRtl ? toArabic(value, 1) : format(new Date(value), 'dd-MMM-yyyy')
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='font-medium'>{value || '-'}</div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
  className,
  spanClass,
  onAdd,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
  spanClass?: string
  onAdd?: () => void
}) {
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return (
    <Card className='overflow-hidden transition-all duration-200 hover:shadow-md'>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-3'>
            <div className={className}>{icon}</div>
            <span className={cn('text-base font-semibold', spanClass)}>
              {title}
            </span>
          </CardTitle>

          {onAdd && (
            <Button size='sm' variant='outline' onClick={onAdd}>
              <Plus className='mr-2 h-4 w-4' />
              {isRtl ? 'إضافة' : 'Add'} {title}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-5'>{children}</CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
      No records found
    </div>
  )
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void
  onDelete?: () => void
}) {
  const ct = useTranslations('common')
  if (!onEdit && !onDelete) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='icon' variant='ghost' aria-label='Row actions'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className='mr-2 h-4 w-4' />
            {ct('edit')}
          </DropdownMenuItem>
        )}

        {/* <DropdownMenuSeparator /> */}
        {onEdit && onDelete && <DropdownMenuSeparator />}

        {/* <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={onDelete}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem> */}
        {onDelete && (
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={onDelete}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {ct('delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
  //console.log('isRtl ' + isRtl)

  const identifications = personalDetails?.identifications ?? []
  const emails = personalDetails?.emails ?? []
  const phones = personalDetails?.phoneNumbers ?? []
  const dependents = personalDetails?.dependents ?? []
  const addresses = personalDetails?.addresses ?? []
  const emergencyContacts = personalDetails?.emergencyContacts ?? []
  const visas = personalDetails?.visas ?? []

  //console.log('Personal Details: ', addresses)

  return (
    <div className='space-y-6'>
      <SectionCard
        title={it('idTitle')}
        //icon={<IdCard className='h-5 w-5 text-green-600' />}
        icon={
          <span
            className={cn(
              'inline-block text-3xl leading-none',
              !isRtl ? 'transform -scale-x-100' : '',
            )}
          >
            📇
          </span>
        }
        className='flex h-10 w-10 items-center justify-center rounded-xl'
        spanClass='text-green-600'
        onAdd={onAddIdentification}
      >
        <div className='space-y-4'>
          {identifications.length === 0 ? (
            <EmptyState />
          ) : (
            identifications.map((item) => {
              const status = getExpiryStatus(item.expiryDate, isRtl)
              //const isExpired = new Date(item.expiryDate) < new Date()
              //console.log('Expiry Status: ', item.type)
              const isExpired = item.expiryDate
                ? new Date(item.expiryDate) < new Date()
                : false
              return (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border border-muted-foreground/10 p-5 shadow-sm transition-all hover:shadow-md ${isRtl ? 'border-r-4' : 'border-l-4'} ${status.bgClass} ${status.borderClass} ${status.pulseClass}`}
                >
                  {/* Header Section */}
                  <div className='mb-5 border-b border-muted/50 pb-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 text-base font-bold tracking-tight text-foreground capitalize'>
                        {/* {item.type.replace('_', ' ')} */}
                        {et(item.type)}
                      </div>

                      <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
                        {isExpired && (
                          <Badge
                            variant='destructive'
                            className='rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm'
                          >
                            🚨 {ct('expired')}
                          </Badge>
                        )}

                        {!isExpired &&
                          status.diffDays !== null &&
                          status.diffDays > 0 &&
                          status.diffDays <= 30 && (
                            <Badge className='rounded-full border border-red-400 bg-red-600 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white shadow-sm hover:bg-red-600'>
                              ⚠️{' '}
                              {ct.rich('expiringMessage1', {
                                item: status.diffDays,
                              })}
                            </Badge>
                          )}

                        {!isExpired &&
                          status.diffDays !== null &&
                          status.diffDays > 30 &&
                          status.diffDays <= 60 && (
                            <Badge className='rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white shadow-sm hover:bg-orange-500'>
                              {ct.rich('expiringMessage2', {
                                item: status.diffDays,
                              })}
                            </Badge>
                          )}

                        {!isExpired &&
                          status.diffDays !== null &&
                          status.diffDays > 60 &&
                          status.diffDays <= 90 && (
                            <Badge className='rounded-full border border-yellow-500/40 bg-yellow-500/20 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400'>
                              <span className='mr-1 inline-block'>⏰</span>
                              {ct.rich('expiringMessage3', {
                                item: status.diffDays,
                              })}
                            </Badge>
                          )}

                        {item.isCurrent && (
                          <Badge
                            variant='secondary'
                            className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 shadow-sm dark:text-emerald-400'
                          >
                            {ct('current')}
                          </Badge>
                        )}

                        <RowActions
                          onEdit={() => onEditIdentification?.(item.id)}
                          onDelete={() => onDeleteIdentification?.(item.id)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Grid Section */}
                  <div className='grid gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'>
                    <InfoRow
                      label={it('number')}
                      value={
                        isRtl
                          ? toPersianDigits(item.identificationNumber)
                          : item.identificationNumber
                      }
                    />
                    <InfoRow
                      label={it('issueDate')}
                      value={formatDate(item.issueDate, isRtl)}
                    />
                    <InfoRow
                      label={it('expiryDate')}
                      value={formatDate(item.expiryDate, isRtl)}
                    />
                    <InfoRow
                      label={it('occupation')}
                      value={dash(item.occupation)}
                    />
                    <InfoRow
                      label={it('sponsor')}
                      value={dash(
                        isRtl ? toPersianDigits(item.sponsor) : item.sponsor,
                      )}
                    />
                    <InfoRow
                      label={it('authority')}
                      value={dash(item.issuingAuthority)}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </SectionCard>

      <div className='grid gap-6 lg:grid-cols-2'>
        <SectionCard
          title={pt('phoneTitle')}
          icon={<span className='text-3xl leading-none'>☎️</span>}
          className='flex h-10 w-10 items-center justify-center rounded-xl'
          spanClass='text-purple-400'
          onAdd={onAddPhone}
        >
          <div className='space-y-3'>
            {phones.length === 0 ? (
              <EmptyState />
            ) : (
              phones.map((phone) => {
                const number = isRtl
                  ? toPersianDigits(phone.countryCode + '' + phone.phoneNumber)
                  : phone.countryCode + '' + phone.phoneNumber

                return (
                  <div key={phone.id} className='rounded-xl border p-4'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <div
                        className='font-semibold'
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        {number}
                      </div>

                      <div className='flex flex-wrap items-center justify-end gap-2'>
                        {phone.isPrimary && <Badge>{pt('primary')}</Badge>}

                        {phone.isWhatsapp && (
                          <Badge variant='outline'>{pt('whatsApp')}</Badge>
                        )}

                        <div
                          className={cn(
                            'flex items-center',
                            isRtl ? 'mr-1' : 'ml-1',
                          )}
                        >
                          <RowActions
                            onEdit={() => onEditPhone?.(phone.id)}
                            onDelete={() => onDeletePhone?.(phone.id)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='grid gap-3 md:grid-cols-2'>
                      <InfoRow label={pt('type')} value={pt(phone.type)} />
                      <InfoRow
                        label={pt('extension')}
                        value={dash(phone.extension)}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={emt('emailTitle')}
          // icon={<Mail className='h-5 w-5 text-teal-500' />}
          icon={
            <span
              className={cn(
                'inline-block text-3xl leading-none',
                !isRtl ? 'transform -scale-x-100' : '',
              )}
            >
              📬
            </span>
          }
          className='flex h-10 w-10 items-center justify-center rounded-xl '
          spanClass='text-teal-500'
          onAdd={onAddEmail}
        >
          <div className='space-y-3'>
            {emails.length === 0 ? (
              <EmptyState />
            ) : (
              emails.map((email) => (
                <div key={email.id} className='rounded-xl border p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate font-semibold'>
                        {email.email}
                      </div>
                      <div className='text-sm text-muted-foreground capitalize'>
                        {emt(email.type)}
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center justify-end gap-2'>
                      {email.isPrimary && <Badge>{emt('primary')}</Badge>}

                      <div
                        className={cn(
                          'flex items-center',
                          isRtl ? 'mr-1' : 'ml-1',
                        )}
                      >
                        <RowActions
                          onEdit={() => onEditEmail?.(email.id)}
                          onDelete={() => onDeleteEmail?.(email.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title={ect('emergencyContactTitle')}
        //icon={<Siren className='h-5 w-5 text-red-500' />}
        icon={<span className='text-3xl leading-none'>🚨</span>}
        className='flex h-10 w-10 items-center justify-center rounded-xl'
        spanClass='text-red-500'
        onAdd={onAddEmergencyContact}
      >
        <div className='space-y-3'>
          {emergencyContacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className={cn(
                'grid gap-4',
                emergencyContacts.length > 1 && 'xl:grid-cols-2',
              )}
            >
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className='relative rounded-xl border p-4 transition-all hover:shadow-sm'
                >
                  <div
                    className={cn(
                      'absolute top-3 z-10',
                      isRtl ? 'left-3' : 'right-3',
                    )}
                  >
                    <RowActions
                      onEdit={() => onEditEmergencyContact?.(contact.id)}
                      onDelete={() => onDeleteEmergencyContact?.(contact.id)}
                    />
                  </div>
                  <div
                    className={cn(
                      'mb-4 font-semibold',
                      isRtl ? 'pl-10' : 'pr-10',
                    )}
                  >
                    {contact.name}
                  </div>

                  <div className='grid gap-3'>
                    <InfoRow
                      label={ect('relationship')}
                      value={ect(contact.relationship)}
                    />
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
                    <InfoRow
                      label={ect('address')}
                      value={dash(contact.address)}
                    />
                    {/*Add  More vertical button that show Edit and Delete when click. */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={dt('dependentsTitle')}
        icon={<Users className='h-5 w-5 text-sky-400' />}
        //icon={<span className='text-3xl leading-none'>🚨</span>}
        className='flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10'
        spanClass='text-sky-400'
        onAdd={onAddDependent}
      >
        <div className='space-y-3'>
          {dependents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className='grid gap-4 md:grid-cols-2'>
              {dependents.map((dep) => (
                <div key={dep.id} className='rounded-xl border p-4'>
                  {/* Header */}

                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div className='font-semibold'>
                      {isRtl
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

                            .join(' ')}
                    </div>

                    <RowActions
                      onEdit={() => onEditDependent?.(dep.id)}
                      onDelete={() => onDeleteDependent?.(dep.id)}
                    />
                  </div>

                  {/* Details */}

                  <div className='grid gap-3 md:grid-cols-2'>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <div className='grid gap-6 lg:grid-cols-2'>
        <SectionCard
          title={at('addressesTitle')}
          //icon={<MapPin className='h-5 w-5 text-pink-500' />}
          icon={<span className='text-3xl leading-none'>🗺️</span>}
          className='flex h-10 w-10 items-center justify-center rounded-xl'
          spanClass='text-pink-500'
          onAdd={onAddAddress}
        >
          <div className='space-y-3'>
            {addresses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className='space-y-4'>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className='relative rounded-xl border p-4 transition-all hover:shadow-sm'
                  >
                    <div
                      className={cn(
                        'absolute top-3 z-10',
                        isRtl ? 'left-3' : 'right-3',
                      )}
                    >
                      <RowActions
                        onEdit={() => onEditAddress?.(address.id)}
                        onDelete={() => onDeleteAddress?.(address.id)}
                      />
                    </div>

                    <div className={cn('mb-4', isRtl ? 'pl-10' : 'pr-10')}>
                      <div className='font-semibold capitalize'>
                        {address.addressType}
                      </div>

                      <div className='mt-2 text-sm leading-6 text-muted-foreground'>
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
                      </div>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <InfoRow
                        label={at('postalCode')}
                        value={dash(address.postalCode)}
                      />

                      <InfoRow
                        label={at('additionalNumber')}
                        value={dash(address.additionalNumber)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={vt('visasTitle')}
          //icon={<Plane className='h-5 w-5 text-sky-400' />}
          icon={
            <span
              className={cn(
                'inline-block text-3xl leading-none',
                isRtl ? 'transform -scale-x-100' : '',
              )}
            >
              🛫
            </span>
          }
          className='flex h-10 w-10 items-center justify-center rounded-xl'
          spanClass='text-sky-400'
          onAdd={onAddVisa}
        >
          <div className='space-y-3'>
            {visas.length === 0 ? (
              <EmptyState />
            ) : (
              <div className='space-y-4'>
                {visas.map((visa) => (
                  <div
                    key={visa.id}
                    className='relative rounded-xl border p-4 transition-all hover:shadow-sm'
                  >
                    <div
                      className={cn(
                        'absolute top-3 z-10',
                        isRtl ? 'left-3' : 'right-3',
                      )}
                    >
                      <RowActions
                        onEdit={() => onEditVisa?.(visa.id)}
                        onDelete={() => onDeleteVisa?.(visa.id)}
                      />
                    </div>

                    <div
                      className={cn(
                        'mb-4 flex items-center justify-between',
                        isRtl ? 'pl-10' : 'pr-10',
                      )}
                    >
                      <div className='font-semibold'>{visa.visaNumber}</div>

                      {visa.isCurrent && <Badge>{ct('current')}</Badge>}
                    </div>

                    <div className='grid gap-3 md:grid-cols-2'>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
