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

function Footer({
  onCancel,
  onSave,
  label,
}: {
  onCancel: () => void
  onSave: () => void
  label: string
}) {
  return (
    <DialogFooter className='border-t bg-muted/40 px-6 py-8 shrink-0'>
      <Button type='button' variant='outline' onClick={onCancel}>
        Cancel
      </Button>

      <Button
        type='button'
        className='bg-slate-950 text-white hover:bg-slate-800'
        onClick={onSave}
      >
        {label}
      </Button>
    </DialogFooter>
  )
}

/* -------------------------------------------------------------------------- */
/* Identification Dialog                                                       */
/* -------------------------------------------------------------------------- */

const emptyIdentification: Identification = {
  id: '',
  type: 'iqama',
  identificationNumber: '',
  issueDate: '',
  expiryDate: '',
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
  //console.log('initialValue is')
  //console.log(initialValue)
  //const dialogKey = initialValue?.id ?? (open ? 'add-identification' : 'closed')
  // const [form, setForm] = useState<Identification>(
  //   initialValue ?? emptyIdentification,
  // )

  // function update<K extends keyof Identification>(
  //   field: K,
  //   value: Identification[K],
  // ) {
  //   setForm((prev) => ({ ...prev, [field]: value }))
  // }

  // async function handleSubmit() {
  //   if (!form.identificationNumber.trim()) return

  //   await onSubmit({
  //     ...form,
  //     id: form.id || createClientId('identification'),
  //     sponsor: form.sponsor || null,
  //     issuingAuthority: form.issuingAuthority || null,
  //     occupation: form.occupation || null,
  //     fileId: form.fileId || null,
  //   })

  //   onOpenChange(false)
  // }

  const dialogKey = initialValue?.id ?? (open ? 'add-identification' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Identification' : 'Add Identification'}
      description='Enter employee identification details.'
      //className='w-[95vw] max-w-7xl overflow-hidden p-0'
      className='w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
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
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  update('type', v as Identification['type'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='national_id'>National ID</SelectItem>
                  <SelectItem value='iqama'>Iqama</SelectItem>
                  <SelectItem value='gcc_id'>GCC ID</SelectItem>
                  <SelectItem value='passport'>Passport</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Identification Number</Label>
              <Input
                className='h-11'
                value={form.identificationNumber}
                onChange={(e) => update('identificationNumber', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Issue Date</Label>
              <Input
                type='date'
                className='h-11'
                value={form.issueDate}
                onChange={(e) => update('issueDate', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Expiry Date</Label>
              <Input
                type='date'
                className='h-11'
                value={form.expiryDate}
                onChange={(e) => update('expiryDate', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Sponsor</Label>
              <Input
                className='h-11'
                value={form.sponsor ?? ''}
                onChange={(e) => update('sponsor', e.target.value || null)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Issuing Authority</Label>
              <Input
                className='h-11'
                value={form.issuingAuthority ?? ''}
                onChange={(e) =>
                  update('issuingAuthority', e.target.value || null)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Occupation</Label>
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
              <Label>Current</Label>
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={() => onOpenChange(false)}
        onSave={handleSubmit}
        label='Save Identification'
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
  const [form, setForm] = useState<PhoneNumber>(initialValue ?? emptyPhone)

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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Phone Number' : 'Add Phone Number'}
      description='Enter employee phone number details.'
      className='w-[95vw] max-w-3xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      update('type', v as PhoneNumber['type'])
                    }
                  >
                    <SelectTrigger className='h-11'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='mobile'>Mobile</SelectItem>
                      <SelectItem value='work'>Work</SelectItem>
                      <SelectItem value='home'>Home</SelectItem>
                      <SelectItem value='fax'>Fax</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Country Code</Label>
                  <Input
                    className='h-11'
                    value={form.countryCode}
                    onChange={(e) => update('countryCode', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Phone Number</Label>
                  <Input
                    className='h-11'
                    value={form.phoneNumber}
                    onChange={(e) => update('phoneNumber', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Extension</Label>
                  <Input
                    className='h-11'
                    value={form.extension ?? ''}
                    onChange={(e) =>
                      update('extension', e.target.value || null)
                    }
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={form.isPrimary}
                    onCheckedChange={(v) => update('isPrimary', Boolean(v))}
                  />
                  <Label>Primary</Label>
                </div>

                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={form.isWhatsapp}
                    onCheckedChange={(v) => update('isWhatsapp', Boolean(v))}
                  />
                  <Label>WhatsApp</Label>
                </div>
              </div>
            </section>
          </div>

          <Footer
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            label='Save Phone'
          />
        </>
      )}
    </FormDialog>
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
  const [form, setForm] = useState<Email>(initialValue ?? emptyEmail)

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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Email' : 'Add Email'}
      description='Enter employee email details.'
      className='w-[95vw] max-w-3xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => update('type', v as Email['type'])}
                  >
                    <SelectTrigger className='h-11'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='work'>Work</SelectItem>
                      <SelectItem value='personal'>Personal</SelectItem>
                      <SelectItem value='secondary'>Secondary</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Email</Label>
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
                  <Label>Primary</Label>
                </div>
              </div>
            </section>
          </div>

          <Footer
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            label='Save Email'
          />
        </>
      )}
    </FormDialog>
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
}

export function AddressDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: DialogProps<Address>) {
  const [form, setForm] = useState<Address>(initialValue ?? emptyAddress)

  function update<K extends keyof Address>(field: K, value: Address[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.city.trim()) return
    if (!form.district.trim()) return
    if (!form.street.trim()) return
    if (!form.postalCode.trim()) return

    await onSubmit({
      ...form,
      id: form.id || createClientId('address'),
      building: form.building || null,
      additionalNumber: form.additionalNumber || null,
    })

    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Address' : 'Add Address'}
      description='Enter employee address details.'
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Address Type</Label>
                  <Select
                    value={form.addressType}
                    onValueChange={(v) =>
                      update('addressType', v as Address['addressType'])
                    }
                  >
                    <SelectTrigger className='h-11'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='home'>Home</SelectItem>
                      <SelectItem value='mailing'>Mailing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Country ID</Label>
                  <Input
                    className='h-11'
                    value={form.countryId}
                    onChange={(e) => update('countryId', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>City</Label>
                  <Input
                    className='h-11'
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>District</Label>
                  <Input
                    className='h-11'
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                  />
                </div>

                <div className='space-y-2 xl:col-span-2'>
                  <Label>Street</Label>
                  <Input
                    className='h-11'
                    value={form.street}
                    onChange={(e) => update('street', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Building</Label>
                  <Input
                    className='h-11'
                    value={form.building ?? ''}
                    onChange={(e) => update('building', e.target.value || null)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Postal Code</Label>
                  <Input
                    className='h-11'
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Additional Number</Label>
                  <Input
                    className='h-11'
                    value={form.additionalNumber ?? ''}
                    onChange={(e) =>
                      update('additionalNumber', e.target.value || null)
                    }
                  />
                </div>
              </div>
            </section>
          </div>

          <Footer
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            label='Save Address'
          />
        </>
      )}
    </FormDialog>
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
  const [form, setForm] = useState<Dependent>(initialValue ?? emptyDependent)

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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Dependent' : 'Add Dependent'}
      description='Enter employee dependent details.'
      className='w-[95vw] max-w-5xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <InputField
                  label='First Name EN'
                  value={form.firstNameEn}
                  onChange={(v) => update('firstNameEn', v)}
                />
                <InputField
                  label='Second Name EN'
                  value={form.secondNameEn ?? ''}
                  onChange={(v) => update('secondNameEn', v || null)}
                />
                <InputField
                  label='Third Name EN'
                  value={form.thirdNameEn ?? ''}
                  onChange={(v) => update('thirdNameEn', v || null)}
                />
                <InputField
                  label='Family Name EN'
                  value={form.familyNameEn}
                  onChange={(v) => update('familyNameEn', v)}
                />
                <InputField
                  label='First Name AR'
                  value={form.firstNameAr}
                  onChange={(v) => update('firstNameAr', v)}
                />
                <InputField
                  label='Second Name AR'
                  value={form.secondNameAr ?? ''}
                  onChange={(v) => update('secondNameAr', v || null)}
                />
                <InputField
                  label='Third Name AR'
                  value={form.thirdNameAr ?? ''}
                  onChange={(v) => update('thirdNameAr', v || null)}
                />
                <InputField
                  label='Family Name AR'
                  value={form.familyNameAr}
                  onChange={(v) => update('familyNameAr', v)}
                />

                <div className='space-y-2'>
                  <Label>Relationship</Label>
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
                      <SelectItem value='spouse'>Spouse</SelectItem>
                      <SelectItem value='child'>Child</SelectItem>
                      <SelectItem value='father'>Father</SelectItem>
                      <SelectItem value='mother'>Mother</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Gender</Label>
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
                      <SelectItem value='male'>Male</SelectItem>
                      <SelectItem value='female'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Date of Birth</Label>
                  <Input
                    type='date'
                    className='h-11'
                    value={form.dateOfBirth ?? ''}
                    onChange={(e) =>
                      update('dateOfBirth', e.target.value || null)
                    }
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
      )}
    </FormDialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Emergency Contact Dialog                                                    */
/* -------------------------------------------------------------------------- */

const emptyEmergencyContact: EmergencyContact = {
  id: '',
  name: '',
  relationship: null,
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
      description='Enter emergency contact details.'
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <InputField
                  label='Name'
                  value={form.name}
                  onChange={(v) => update('name', v)}
                />

                <InputField
                  label='Relationship'
                  value={form.relationship ?? ''}
                  onChange={(v) => update('relationship', v || null)}
                />

                <InputField
                  label='Mobile'
                  value={form.mobile ?? ''}
                  onChange={(v) => update('mobile', v || null)}
                />

                <InputField
                  label='Alternate Mobile'
                  value={form.alternateMobile ?? ''}
                  onChange={(v) => update('alternateMobile', v || null)}
                />

                <div className='space-y-2 xl:col-span-2'>
                  <Label>Address</Label>
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
            label='Save Emergency Contact'
          />
        </>
      )}
    </FormDialog>
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
  const [form, setForm] = useState<Visa>(initialValue ?? emptyVisa)

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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Visa' : 'Add Visa'}
      description='Enter employee visa details.'
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <>
          <div className='space-y-6 px-6 py-5'>
            <section className='rounded-2xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 xl:grid-cols-2'>
                <InputField
                  label='Visa Number'
                  value={form.visaNumber}
                  onChange={(v) => update('visaNumber', v)}
                />

                <InputField
                  label='Visa Type'
                  value={form.visaType ?? ''}
                  onChange={(v) => update('visaType', v || undefined)}
                />

                <div className='space-y-2'>
                  <Label>Issue Date</Label>
                  <Input
                    type='date'
                    className='h-11'
                    value={form.issueDate ?? ''}
                    onChange={(e) =>
                      update('issueDate', e.target.value || null)
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Expiry Date</Label>
                  <Input
                    type='date'
                    className='h-11'
                    value={form.expiryDate ?? ''}
                    onChange={(e) =>
                      update('expiryDate', e.target.value || null)
                    }
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={form.isCurrent}
                    onCheckedChange={(v) => update('isCurrent', Boolean(v))}
                  />
                  <Label>Current</Label>
                </div>
              </div>
            </section>
          </div>

          <Footer
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            label='Save Visa'
          />
        </>
      )}
    </FormDialog>
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
