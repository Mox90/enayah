// src/modules/hr/employees/components/profile/tabs/cards/personal-detail-dialogs.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { DialogFooter } from '@/components/ui/dialog'
//import { FormDialog } from '@/modules/hr/credentials/components/forms'
import type {
  Address,
  Dependent,
  Email,
  EmergencyContact,
  Identification,
  PhoneNumber,
  Visa,
} from '@/modules/hr/employees/types/employee-personal-details.types'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { PhoneCodeCombobox } from '@/modules/countries/components/phone-code'
import { CountryCombobox } from '@/modules/countries/components/country-combobox'
import { useLocale, useTranslations } from 'next-intl'
import { HijriDatePicker } from './hijri-date-picker'
import { DateObject } from 'react-multi-date-picker'
import gregorian from 'react-date-object/calendars/gregorian'
import arabic from 'react-date-object/calendars/arabic'

type DialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: T | null
  onSubmit: (value: T) => void | Promise<void>
}

function createClientId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// function Footer({
//   onCancel,
//   onSave,
//   label,
// }: {
//   onCancel: () => void
//   onSave: () => void
//   label: string
// }) {
//   return (
//     <DialogFooter className='border-t bg-muted/40 px-6 py-8 shrink-0'>
//       <Button type='button' variant='outline' onClick={onCancel}>
//         Cancel
//       </Button>

//       <Button
//         type='button'
//         className='bg-slate-950 text-white hover:bg-slate-800'
//         onClick={onSave}
//       >
//         {label}
//       </Button>
//     </DialogFooter>
//   )
// }

/* -------------------------------------------------------------------------- */
/* Identification Dialog                                                       */
/* -------------------------------------------------------------------------- */

const emptyIdentification: Identification = {
  id: '',
  type: 'iqama',
  identificationNumber: '',
  issueDate: '',
  expiryDate: '',
  issueDateHijri: null,
  expiryDateHijri: null,
  dateCalendar: 'gregorian',
  sponsor: null,
  issuingAuthority: null,
  occupation: null,
  isCurrent: true,
  fileId: null,
}

export function IdentificationDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Identification>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-identification' : 'closed')
  const it = useTranslations('identifications')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        initialValue ? it('editIdentificationBtn') : it('addIdentificationBtn')
      }
      description={it('idTitleSub')}
      //className='w-[95vw] max-w-7xl overflow-hidden p-0'
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <IdentificationDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function IdentificationDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: Identification | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Identification) => void | Promise<void>
}) {
  const it = useTranslations('identifications')
  const et = useTranslations('employees')
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [form, setForm] = useState<Identification>(
    initialValue ?? emptyIdentification,
  )

  function update<K extends keyof Identification>(
    field: K,
    value: Identification[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.identificationNumber.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('identification'),
      sponsor: form.sponsor || null,
      issuingAuthority: form.issuingAuthority || null,
      occupation: form.occupation || null,
      fileId: form.fileId || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('idType')}</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  update('type', v as Identification['type'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='national_id'>
                    {et('national_id')}
                  </SelectItem>
                  <SelectItem value='iqama'>{et('iqama')}</SelectItem>
                  <SelectItem value='gcc_id'>{et('gcc_id')}</SelectItem>
                  <SelectItem value='passport'>{et('passport')}</SelectItem>
                  <SelectItem value='other'>{et('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{it('number')}</Label>
              <Input
                className='h-11'
                value={form.identificationNumber}
                onChange={(e) => update('identificationNumber', e.target.value)}
              />
            </div>

            {form.type === 'iqama' && (
              <>
                <div className='space-y-2'>
                  <Label>{it('issueDateHijri')}</Label>
                  {/* <HijriDatePicker
                    value={form.issueDateHijri}
                    onChange={(date) => {
                      update('issueDateHijri', date.hijri)
                      // converted Gregorian
                      update('issueDate', date.gregorian)
                      update('dateCalendar', 'hijri')
                    }}
                  /> */}
                  <HijriDatePicker
                    value={form.issueDateHijri}
                    onChange={({ hijri, gregorian }) => {
                      setForm((prev) => ({
                        ...prev,
                        issueDateHijri: hijri,
                        issueDate: gregorian,
                        dateCalendar: 'hijri',
                      }))
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>{it('expiryDateHijri')}</Label>
                  {/* <HijriDatePicker
                    value={form.expiryDateHijri}
                    onChange={(date) => {
                      update('expiryDateHijri', date.hijri)
                      // used by notification generator
                      update('expiryDate', date.gregorian)
                      update('dateCalendar', 'hijri')
                    }}
                  /> */}
                  <HijriDatePicker
                    value={form.expiryDateHijri}
                    onChange={({ hijri, gregorian }) => {
                      setForm((prev) => ({
                        ...prev,
                        expiryDateHijri: hijri,
                        expiryDate: gregorian,
                        dateCalendar: 'hijri',
                      }))
                    }}
                  />
                </div>
              </>
            )}

            <div className='space-y-2'>
              <Label>{it('issueDate')}</Label>
              {/* <Input
                type='date'
                className='h-11'
                value={form.issueDate}
                onChange={(e) => update('issueDate', e.target.value)}
              /> */}
              <Input
                type='date'
                className='h-11'
                value={form.issueDate || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) {
                    setForm((prev) => ({
                      ...prev,
                      issueDate: '',
                      issueDateHijri: null,
                    }))
                    return
                  }

                  // Convert standard date back to Hijri format
                  const hijriConverted = new DateObject({
                    date: val,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((prev) => ({
                    ...prev,
                    issueDate: val,
                    issueDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              />
            </div>

            <div className='space-y-2'>
              <Label>{it('expiryDate')}</Label>
              {/* <Input
                type='date'
                className='h-11'
                value={form.expiryDate}
                onChange={(e) => update('expiryDate', e.target.value)}
              /> */}
              <Input
                type='date'
                className='h-11'
                value={form.expiryDate || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) {
                    setForm((prev) => ({
                      ...prev,
                      expiryDate: '',
                      expiryDateHijri: null,
                    }))
                    return
                  }

                  // Convert standard date back to Hijri format
                  const hijriConverted = new DateObject({
                    date: val,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((prev) => ({
                    ...prev,
                    expiryDate: val,
                    expiryDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              />
            </div>

            <div className='space-y-2'>
              <Label>{it('sponsor')}</Label>
              <Input
                className='h-11'
                value={form.sponsor ?? ''}
                onChange={(e) => update('sponsor', e.target.value || null)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{it('authority')}</Label>
              <Input
                className='h-11'
                value={form.issuingAuthority ?? ''}
                onChange={(e) =>
                  update('issuingAuthority', e.target.value || null)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>{it('occupation')}</Label>
              <Input
                className='h-11'
                value={form.occupation ?? ''}
                onChange={(e) => update('occupation', e.target.value || null)}
              />
            </div>

            <div className='flex items-center gap-2 pt-8'>
              <Checkbox
                checked={form.isCurrent}
                onCheckedChange={(v) => update('isCurrent', Boolean(v))}
              />
              <Label>{ct('current')}</Label>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={it('saveIdentification')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Phone Dialog                                                                */
/* -------------------------------------------------------------------------- */

const emptyPhone: PhoneNumber = {
  id: '',
  type: 'mobile',
  countryCode: '+966',
  phoneNumber: '',
  extension: null,
  isPrimary: false,
  isWhatsapp: false,
}

export function PhoneDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<PhoneNumber>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-phone' : 'closed')
  const pt = useTranslations('phoneNumber')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? pt('editPhoneNumberBtn') : pt('addPhoneNumberBtn')}
      description='Enter employee phone details.'
      //className='w-[95vw] max-w-7xl overflow-hidden p-0'
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <PhoneDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function PhoneDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: PhoneNumber | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: PhoneNumber) => void | Promise<void>
}) {
  const pt = useTranslations('phoneNumber')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [form, setForm] = useState<PhoneNumber>(
    initialValue ?? {
      ...emptyPhone,
      countryCode: emptyPhone.countryCode || '+966',
    },
  )

  function update<K extends keyof PhoneNumber>(
    field: K,
    value: PhoneNumber[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.phoneNumber.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('phone'),
      extension: form.extension || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{pt('type')}</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update('type', v as PhoneNumber['type'])}
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='mobile'>{pt('mobile')}</SelectItem>
                  <SelectItem value='work'>{pt('work')}</SelectItem>
                  <SelectItem value='home'>{pt('home')}</SelectItem>
                  <SelectItem value='fax'>{pt('fax')}</SelectItem>
                  <SelectItem value='other'>{pt('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{pt('mobile')}</Label>

              <div className='flex h-11 overflow-hidden rounded-md border border-input bg-background'>
                <PhoneCodeCombobox
                  value={form.countryCode || '+966'}
                  onChange={(value) => update('countryCode', value)}
                  className='rounded-none border-0 border-r'
                />

                <Input
                  className='border-0! rounded-none! bg-transparent! shadow-none! focus-visible:ring-0 focus-visible:ring-offset-0'
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  placeholder='512345678'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>{pt('extension')}</Label>
              <Input
                className='h-11'
                value={form.extension ?? ''}
                onChange={(e) => update('extension', e.target.value || null)}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={form.isPrimary}
                onCheckedChange={(v) => update('isPrimary', Boolean(v))}
              />
              <Label>{pt('primary')}</Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={form.isWhatsapp}
                onCheckedChange={(v) => update('isWhatsapp', Boolean(v))}
              />
              <Label>{pt('whatsapp')}</Label>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={pt('savePhone')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Email Dialog                                                                */
/* -------------------------------------------------------------------------- */

const emptyEmail: Email = {
  id: '',
  type: 'personal',
  email: '',
  isPrimary: false,
}

export function EmailDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Email>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-email' : 'closed')
  const emt = useTranslations('email')
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? emt('editEmailBtn') : emt('addEmailBtn')}
      description={emt('emailSub')}
      //className='w-[95vw] max-w-3xl overflow-hidden p-0'
      //headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <EmailDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function EmailDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: Email | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Email) => void | Promise<void>
}) {
  const [form, setForm] = useState<Email>(initialValue ?? emptyEmail)
  const emt = useTranslations('email')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  function update<K extends keyof Email>(field: K, value: Email[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.email.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('email'),
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{emt('type')}</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update('type', v as Email['type'])}
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='work'>{emt('work')}</SelectItem>
                  <SelectItem value='personal'>{emt('personal')}</SelectItem>
                  <SelectItem value='secondary'>{emt('secondary')}</SelectItem>
                  <SelectItem value='other'>{emt('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{emt('emailAddress')}</Label>
              <Input
                type='email'
                className='h-11'
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={form.isPrimary}
                onCheckedChange={(v) => update('isPrimary', Boolean(v))}
              />
              <Label>{emt('primary')}</Label>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={emt('saveEmail')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Address Dialog                                                              */
/* -------------------------------------------------------------------------- */

const emptyAddress: Address = {
  id: '',
  addressType: 'home',
  countryId: '',
  city: '',
  district: '',
  street: '',
  building: null,
  postalCode: '',
  additionalNumber: null,
  stateProvince: '',
  country: {
    id: '',
    name: '',
    nameAr: '',
  },
}

export function AddressDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Address>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-address' : 'closed')
  const at = useTranslations('addresses')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? at('editAddressBtn') : at('addAddressBtn')}
      description={at('addressSub')}
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <AddressDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function AddressDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: Address | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Address) => void | Promise<void>
}) {
  const [form, setForm] = useState<Address>(initialValue ?? emptyAddress)
  const at = useTranslations('addresses')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function update<K extends keyof Address>(field: K, value: Address[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.city.trim()) return
    if (!form.district.trim()) return
    if (!form.street.trim()) return
    if (!form.postalCode.trim()) return
    //if (!form.stateProvince.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('address'),
      building: form.building || null,
      additionalNumber: form.additionalNumber || null,
      stateProvince: form.stateProvince || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{at('addressType')}</Label>
              <Select
                value={form.addressType}
                onValueChange={(v) =>
                  update('addressType', v as Address['addressType'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='home'>{at('home')}</SelectItem>
                  <SelectItem value='mailing'>{at('mailing')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{at('building')}</Label>
              <Input
                className='h-11'
                value={form.building ?? ''}
                onChange={(e) => update('building', e.target.value || null)}
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>{at('streetAddress')}</Label>
              <Input
                className='h-11'
                value={form.street}
                onChange={(e) => update('street', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('district')}</Label>
              <Input
                className='h-11'
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('city')}</Label>
              <Input
                className='h-11'
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('stateProvince')}</Label>
              <Input
                className='h-11'
                value={form.stateProvince ?? ''}
                onChange={(e) => update('stateProvince', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('postalCode')}</Label>
              <Input
                className='h-11'
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('additionalNumber')}</Label>
              <Input
                className='h-11'
                value={form.additionalNumber ?? ''}
                onChange={(e) =>
                  update('additionalNumber', e.target.value || null)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>{at('country')}</Label>
              {/* <Input
                className='h-11'
                value={form.countryId}
                onChange={(e) => update('countryId', e.target.value)}
              /> */}

              <CountryCombobox
                value={form.countryId}
                placeholder={at('selectCountry')}
                onChange={(country) => {
                  update('countryId', country.id)
                  //update('countryNameEn', country.name)
                  //update('countryNameAr', country.nameAr)
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={at('saveAddress')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Dependent Dialog                                                            */
/* -------------------------------------------------------------------------- */

const emptyDependent: Dependent = {
  id: '',
  firstNameEn: '',
  secondNameEn: null,
  thirdNameEn: null,
  familyNameEn: '',
  firstNameAr: '',
  secondNameAr: null,
  thirdNameAr: null,
  familyNameAr: '',
  relationship: 'child',
  gender: 'male',
  dateOfBirth: null,
}

export function DependentDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Dependent>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-dependent' : 'closed')
  const dt = useTranslations('dependents')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? dt('editDependentBtn') : dt('addDependentBtn')}
      description={dt('dependentsSub')}
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <DependentDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function DependentDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: Dependent | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Dependent) => void | Promise<void>
}) {
  const [form, setForm] = useState<Dependent>(initialValue ?? emptyDependent)
  const dt = useTranslations('dependents')
  const et = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function update<K extends keyof Dependent>(field: K, value: Dependent[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.firstNameEn.trim()) return
    if (!form.familyNameEn.trim()) return
    if (!form.firstNameAr.trim()) return
    if (!form.familyNameAr.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('dependent'),
      secondNameEn: form.secondNameEn || null,
      thirdNameEn: form.thirdNameEn || null,
      secondNameAr: form.secondNameAr || null,
      thirdNameAr: form.thirdNameAr || null,
      dateOfBirth: form.dateOfBirth || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <InputField
              label={dt('firstNameEn')}
              value={form.firstNameEn}
              onChange={(v) => update('firstNameEn', v)}
            />
            <InputField
              label={dt('secondNameEn')}
              value={form.secondNameEn ?? ''}
              onChange={(v) => update('secondNameEn', v || null)}
            />
            <InputField
              label={dt('thirdNameEn')}
              value={form.thirdNameEn ?? ''}
              onChange={(v) => update('thirdNameEn', v || null)}
            />
            <InputField
              label={dt('familyNameEn')}
              value={form.familyNameEn}
              onChange={(v) => update('familyNameEn', v)}
            />
            <InputField
              label={dt('firstNameAr')}
              value={form.firstNameAr}
              onChange={(v) => update('firstNameAr', v)}
            />
            <InputField
              label={dt('secondNameAr')}
              value={form.secondNameAr ?? ''}
              onChange={(v) => update('secondNameAr', v || null)}
            />
            <InputField
              label={dt('thirdNameAr')}
              value={form.thirdNameAr ?? ''}
              onChange={(v) => update('thirdNameAr', v || null)}
            />
            <InputField
              label={dt('familyNameAr')}
              value={form.familyNameAr}
              onChange={(v) => update('familyNameAr', v)}
            />

            <div className='space-y-2'>
              <Label>{dt('relationship')}</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  update('relationship', v as Dependent['relationship'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='spouse'>{dt('spouse')}</SelectItem>
                  <SelectItem value='child'>{dt('child')}</SelectItem>
                  <SelectItem value='father'>{dt('father')}</SelectItem>
                  <SelectItem value='mother'>{dt('mother')}</SelectItem>
                  <SelectItem value='other'>{dt('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{dt('gender')}</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  update('gender', v as Dependent['gender'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='male'>{et('male')}</SelectItem>
                  <SelectItem value='female'>{et('female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{dt('dateOfBirth')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.dateOfBirth ?? ''}
                onChange={(e) => update('dateOfBirth', e.target.value || null)}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label='Save Dependent'
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Emergency Contact Dialog                                                    */
/* -------------------------------------------------------------------------- */

const emptyEmergencyContact: EmergencyContact = {
  id: '',
  name: '',
  relationship: 'spouse',
  mobile: null,
  alternateMobile: null,
  address: null,
}

export function EmergencyContactDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<EmergencyContact>) {
  const dialogKey =
    initialValue?.id ?? (open ? 'add-emergency-contact' : 'closed')
  const ect = useTranslations('emergencyContact')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        initialValue
          ? ect('emergencyContactTitle')
          : ect('addEmergencyContactBtn')
      }
      description={ect('emergencyContactSub')}
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <EmergencyContactDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function EmergencyContactDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: EmergencyContact | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: EmergencyContact) => void | Promise<void>
}) {
  const ect = useTranslations('emergencyContact')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<EmergencyContact>(
    initialValue ?? emptyEmergencyContact,
  )

  function update<K extends keyof EmergencyContact>(
    field: K,
    value: EmergencyContact[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('emergency-contact'),
      relationship: form.relationship || null,
      mobile: form.mobile || null,
      alternateMobile: form.alternateMobile || null,
      address: form.address || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <InputField
              label={ect('name')}
              value={form.name}
              onChange={(v) => update('name', v)}
            />

            {/* <InputField
              label={ect('relationship')}
              value={form.relationship ?? ''}
              onChange={(v) => update('relationship', v || null)}
            /> */}
            <div className='space-y-2'>
              <Label>{ect('relationship')}</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  update('relationship', v as EmergencyContact['relationship'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='spouse'>{ect('spouse')}</SelectItem>
                  <SelectItem value='child'>{ect('child')}</SelectItem>
                  <SelectItem value='father'>{ect('father')}</SelectItem>
                  <SelectItem value='mother'>{ect('mother')}</SelectItem>
                  <SelectItem value='other'>{ect('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <InputField
              label={ect('phoneNumber')}
              value={form.mobile ?? ''}
              onChange={(v) => update('mobile', v || null)}
            />

            <InputField
              label={ect('alternateMobile')}
              value={form.alternateMobile ?? ''}
              onChange={(v) => update('alternateMobile', v || null)}
            />

            <div className='space-y-2 xl:col-span-2'>
              <Label>{ect('address')}</Label>
              <Textarea
                value={form.address ?? ''}
                onChange={(e) => update('address', e.target.value || null)}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={ect('saveEmergencyContact')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Visa Dialog                                                                 */
/* -------------------------------------------------------------------------- */

const emptyVisa: Visa = {
  id: '',
  visaNumber: '',
  visaType: '',
  issueDate: null,
  expiryDate: null,
  isCurrent: true,
  fileId: null,
}

export function VisaDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Visa>) {
  const dialogKey = initialValue?.id ?? (open ? 'add-visa' : 'closed')
  const vt = useTranslations('visas')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? vt('editVisaBtn') : vt('addVisaBtn')}
      description={vt('visaSub')}
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <VisaDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </FormDialog>
  )
}

function VisaDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
}: {
  initialValue?: Visa | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Visa) => void | Promise<void>
}) {
  const [form, setForm] = useState<Visa>(initialValue ?? emptyVisa)
  const vt = useTranslations('visas')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function update<K extends keyof Visa>(field: K, value: Visa[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.visaNumber.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('visa'),
      visaType: form.visaType || undefined,
      issueDate: form.issueDate || null,
      expiryDate: form.expiryDate || null,
      fileId: form.fileId || null,
    })

    onOpenChange(false)
  }

  return (
    <>
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <InputField
              label={vt('visaNumber')}
              value={form.visaNumber}
              onChange={(v) => update('visaNumber', v)}
            />

            <InputField
              label={vt('visaType')}
              value={form.visaType ?? ''}
              onChange={(v) => update('visaType', v || undefined)}
            />

            <div className='space-y-2'>
              <Label>{vt('issueDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.issueDate ?? ''}
                onChange={(e) => update('issueDate', e.target.value || null)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{vt('expiryDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value || null)}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={form.isCurrent}
                onCheckedChange={(v) => update('isCurrent', Boolean(v))}
              />
              <Label>{vt('current')}</Label>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label={vt('saveVisa')}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Small reusable field                                                        */
/* -------------------------------------------------------------------------- */

function InputField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Input
        className='h-11'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
