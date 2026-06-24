'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, IdCard, Users, MapPin, Siren, Plane } from 'lucide-react'
import { format } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { getExpiryStatus, toArabic, toPersianDigits } from '@/utils/utilities'
import { EmployeePersonalDetails } from '@/modules/hr/employees/types/employee-personal-details.types'

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

function EmptyState() {
  return (
    <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
      No records found
    </div>
  )
}

interface Props {
  personalDetails?: EmployeePersonalDetails
}

export function PersonalDetailsCards({ personalDetails }: Props) {
  const et = useTranslations('employees')
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

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IdCard className='h-5 w-5' />
            Identifications
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {identifications.length === 0 ? (
            <EmptyState />
          ) : (
            identifications.map((item) => {
              //   <div key={item.id} className='rounded-xl border bg-muted/20 p-4'>
              //     <div className='mb-4 flex items-center justify-between'>
              //       <div className='font-semibold capitalize'>
              //         {item.type.replace('_', ' ')}
              //       </div>

              //       {item.isCurrent && (
              //         <Badge
              //           variant='outline'
              //           className='bg-green-50 text-green-700'
              //         >
              //           Current
              //         </Badge>
              //       )}
              //     </div>

              //     <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              //       <InfoRow label='Number' value={item.identificationNumber} />
              //       <InfoRow
              //         label='Issue Date'
              //         value={formatDate(item.issueDate, isRtl)}
              //       />
              //       <InfoRow
              //         label='Expiry Date'
              //         value={formatDate(item.expiryDate, isRtl)}
              //       />
              //       <InfoRow label='Occupation' value={dash(item.occupation)} />
              //       <InfoRow label='Sponsor' value={dash(item.sponsor)} />
              //       <InfoRow
              //         label='Authority'
              //         value={dash(item.issuingAuthority)}
              //       />
              //     </div>
              //   </div>
              const status = getExpiryStatus(item.expiryDate, isRtl)
              //const isExpired = new Date(item.expiryDate) < new Date()
              const isExpired = item.expiryDate
                ? new Date(item.expiryDate) < new Date()
                : false
              return (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border border-muted-foreground/10 p-5 shadow-sm transition-all hover:shadow-md ${isRtl ? 'border-r-4' : 'border-l-4'} ${status.bgClass} ${status.borderClass} ${status.pulseClass}`}
                >
                  {/* Header Section */}
                  <div className='mb-5 flex items-center justify-between border-b border-muted/50 pb-3'>
                    <div className='text-base font-bold tracking-tight text-foreground capitalize'>
                      {item.type.replace('_', ' ')}
                    </div>

                    <div className='flex gap-2'>
                      {/* 1. Alreay Lapsed / Expired Block */}
                      {isExpired && (
                        <Badge
                          variant='destructive'
                          className='font-bold px-2.5 py-0.5 rounded-full text-xs animate-bounce shadow-sm'
                        >
                          Expired
                        </Badge>
                      )}

                      {/* 2. Critical warning: Within 30 Days (Flashy Pulsing Deep Red) */}
                      {!isExpired &&
                        status.diffDays !== null &&
                        status.diffDays > 0 &&
                        status.diffDays <= 30 && (
                          <Badge className='bg-red-600 hover:bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs tracking-wide shadow-sm animate-pulse border border-red-400'>
                            ⚠️ Expiring in {status.diffDays} days!
                          </Badge>
                        )}

                      {/* 3. Urgent notice: Within 60 Days (Bright Flashy Orange) */}
                      {!isExpired &&
                        status.diffDays !== null &&
                        status.diffDays > 30 &&
                        status.diffDays <= 60 && (
                          <Badge className='bg-orange-500 hover:bg-orange-500 text-white font-semibold px-2.5 py-0.5 rounded-full text-xs tracking-wide shadow-sm'>
                            Expiring within {status.diffDays} days
                          </Badge>
                        )}

                      {/* 4. Attention flag: Within 90 Days (Catchy Yellow Outline with Glow) */}
                      {!isExpired &&
                        status.diffDays !== null &&
                        status.diffDays > 60 &&
                        status.diffDays <= 90 && (
                          <Badge className='bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40 font-medium px-2.5 py-0.5 rounded-full text-xs transition-transform'>
                            <span className='inline-block animate-[shake_0.5s_ease-in-out_infinite] mr-1'>
                              ⏰
                            </span>
                            Expires in {status.diffDays} days
                          </Badge>
                        )}

                      {item.isCurrent && (
                        <Badge
                          variant='secondary'
                          className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium px-2.5 py-0.5 rounded-full text-xs shadow-sm'
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Data Grid Section */}
                  <div className='grid gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'>
                    <InfoRow label='Number' value={item.identificationNumber} />
                    <InfoRow
                      label='Issue Date'
                      value={formatDate(item.issueDate, isRtl)}
                    />
                    <InfoRow
                      label='Expiry Date'
                      value={formatDate(item.expiryDate, isRtl)}
                    />
                    <InfoRow label='Occupation' value={dash(item.occupation)} />
                    <InfoRow label='Sponsor' value={dash(item.sponsor)} />
                    <InfoRow
                      label='Authority'
                      value={dash(item.issuingAuthority)}
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Phone className='h-5 w-5' />
              Phone Numbers
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-3'>
            {phones.length === 0 ? (
              <EmptyState />
            ) : (
              phones.map((phone) => {
                const number = isRtl
                  ? toPersianDigits(phone.countryCode + '' + phone.phoneNumber)
                  : phone.countryCode + '' + phone.phoneNumber
                return (
                  <div key={phone.id} className='rounded-xl border p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div
                        className='font-semibold'
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        {number}
                      </div>

                      <div className='flex gap-2'>
                        {phone.isPrimary && <Badge>Primary</Badge>}
                        {phone.isWhatsapp && (
                          <Badge variant='outline'>WhatsApp</Badge>
                        )}
                      </div>
                    </div>

                    <div className='grid gap-3 md:grid-cols-2'>
                      <InfoRow label='Type' value={phone.type} />
                      <InfoRow
                        label='Extension'
                        value={dash(phone.extension)}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mail className='h-5 w-5' />
              Emails
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-3'>
            {emails.length === 0 ? (
              <EmptyState />
            ) : (
              emails.map((email) => (
                <div key={email.id} className='rounded-xl border p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-semibold'>{email.email}</div>
                      <div className='text-sm text-muted-foreground capitalize'>
                        {email.type}
                      </div>
                    </div>

                    {email.isPrimary && <Badge>Primary</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Siren className='h-5 w-5' />
            Emergency Contacts
          </CardTitle>
        </CardHeader>

        <CardContent>
          {emergencyContacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className='grid gap-4 md:grid-cols-2'>
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className='rounded-xl border p-4'>
                  <div className='mb-4 font-semibold'>{contact.name}</div>

                  <div className='grid gap-3'>
                    <InfoRow
                      label='Relationship'
                      value={dash(contact.relationship)}
                    />
                    <InfoRow label='Mobile' value={dash(contact.mobile)} />
                    <InfoRow
                      label='Alternate Mobile'
                      value={dash(contact.alternateMobile)}
                    />
                    <InfoRow label='Address' value={dash(contact.address)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Dependents
          </CardTitle>
        </CardHeader>

        <CardContent>
          {dependents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className='grid gap-4 md:grid-cols-2'>
              {dependents.map((dep) => (
                <div key={dep.id} className='rounded-xl border p-4'>
                  <div className='mb-4 font-semibold'>
                    {[
                      dep.firstNameEn,
                      dep.secondNameEn,
                      dep.thirdNameEn,
                      dep.familyNameEn,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </div>

                  <div className='grid gap-3 md:grid-cols-2'>
                    <InfoRow label='Relationship' value={dep.relationship} />
                    <InfoRow label='Gender' value={dep.gender} />
                    <InfoRow
                      label='Date of Birth'
                      value={formatDate(dep.dateOfBirth, isRtl)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Addresses
            </CardTitle>
          </CardHeader>

          <CardContent>
            {addresses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className='space-y-4'>
                {addresses.map((address) => (
                  <div key={address.id} className='rounded-xl border p-4'>
                    <div className='mb-4 font-semibold capitalize'>
                      {address.addressType}
                    </div>

                    <div className='grid gap-3 md:grid-cols-2'>
                      <InfoRow label='City' value={address.city} />
                      <InfoRow label='District' value={address.district} />
                      <InfoRow label='Street' value={address.street} />
                      <InfoRow
                        label='Building'
                        value={dash(address.building)}
                      />
                      <InfoRow label='Postal Code' value={address.postalCode} />
                      <InfoRow
                        label='Additional No.'
                        value={dash(address.additionalNumber)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plane className='h-5 w-5' />
              Visas
            </CardTitle>
          </CardHeader>

          <CardContent>
            {visas.length === 0 ? (
              <EmptyState />
            ) : (
              <div className='space-y-4'>
                {visas.map((visa) => (
                  <div key={visa.id} className='rounded-xl border p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='font-semibold'>{visa.visaNumber}</div>
                      {visa.isCurrent && <Badge>Current</Badge>}
                    </div>

                    <div className='grid gap-3 md:grid-cols-2'>
                      <InfoRow label='Visa Type' value={dash(visa.visaType)} />
                      <InfoRow
                        label='Issue Date'
                        value={formatDate(visa.issueDate, isRtl)}
                      />
                      <InfoRow
                        label='Expiry Date'
                        value={formatDate(visa.expiryDate, isRtl)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
