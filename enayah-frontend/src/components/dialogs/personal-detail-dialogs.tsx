// src/modules/hr/employees/components/profile/tabs/cards/personal-detail-dialogs.tsx

'use client'

import { ReactNode, useState } from 'react'
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
import { AlertCircle, Save } from 'lucide-react'
import axios from 'axios'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { DatePicker } from './date-picker'

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

/* -------------------------------------------------------------------------- */
/* Identification Dialog                                                       */
/* -------------------------------------------------------------------------- */

type IdentificationDialogProps = DialogProps<Identification> & {
  title?: ReactNode
  description?: ReactNode
  submitLabel?: string

  lockType?: boolean
  lockCurrent?: boolean
  requireExpiryDate?: boolean
}

const emptyIdentification: Identification = {
  id: '',
  type: 'iqama',
  identificationNumber: '',
  issueDate: null,
  expiryDate: null,
  issueDateHijri: null,
  expiryDateHijri: null,
  dateCalendar: 'gregorian',
  sponsor: null,
  issuingAuthority: null,
  occupation: null,
  isCurrent: true,
  fileId: null,
}

// interface ApiErrorResponse {
//   message?: string

//   error?: {
//     message?: string

//     issues?: Array<{
//       path?: Array<string | number>
//       message?: string
//     }>
//   }

//   issues?: Array<{
//     path?: Array<string | number>
//     message?: string
//   }>
// }

type ApiErrorFallbacks = {
  validationFailed: string
  requestFailed: string
  unexpectedError: string
}

function getApiErrorMessage(
  error: unknown,
  fallbacks: ApiErrorFallbacks,
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string' &&
      responseData.message.trim()
    ) {
      return responseData.message
    }

    if (error.response?.status === 422) {
      return fallbacks.validationFailed
    }

    return fallbacks.requestFailed
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallbacks.unexpectedError
}

type IdentificationFieldErrors = {
  type?: string
  identificationNumber?: string
  issueDate?: string
  expiryDate?: string
}

export function IdentificationDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  // title,
  // description,
  submitLabel,

  lockType = false,
  lockCurrent = false,
  requireExpiryDate = false,
}: IdentificationDialogProps) {
  const dialogKey = initialValue?.id ?? (open ? 'add-identification' : 'closed')
  const it = useTranslations('identifications')
  // const locale = useLocale()
  // const isRtl = locale === 'ar'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        initialValue ? it('editIdentificationBtn') : it('addIdentificationBtn')
      }
      description={it('idTitleSub')}
      //className='w-[95vw] max-w-7xl overflow-hidden p-0'
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
    >
      {open && (
        <IdentificationDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          lockType={lockType}
          lockCurrent={lockCurrent}
          requireExpiryDate={requireExpiryDate}
        />
      )}
    </FormDialog>
  )
}

function IdentificationDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  submitLabel,
  lockType,
  lockCurrent,
  requireExpiryDate,
}: {
  initialValue?: Identification | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: Identification) => void | Promise<void>
  submitLabel?: string
  lockType: boolean
  lockCurrent: boolean
  requireExpiryDate: boolean
}) {
  const it = useTranslations('identifications')
  const et = useTranslations('employees')
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<Identification>(
    initialValue ?? emptyIdentification,
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const type = form.type.trim()
  //const identificationNumber = form.identificationNumber.trim()

  const [fieldErrors, setFieldErrors] = useState<IdentificationFieldErrors>({})

  const [submitError, setSubmitError] = useState<string | null>(null)

  function validateForm(): IdentificationFieldErrors {
    const errors: IdentificationFieldErrors = {}

    const normalizedType = form.type.trim()
    const normalizedNumber = form.identificationNumber.trim()
    const issueDate = form.issueDate?.trim()
    const expiryDate = form.expiryDate?.trim()

    if (!normalizedType) {
      errors.type = it('validation.typeRequired')
    }

    if (!normalizedNumber) {
      errors.identificationNumber = it('validation.numberRequired')
    } else if (normalizedNumber.length > 30) {
      errors.identificationNumber = it('validation.numberMaxLength', {
        max: 30,
      })
    } else if (!/^[\p{L}\p{N}-]+$/u.test(normalizedNumber)) {
      errors.identificationNumber = it('validation.numberInvalidCharacters')
    }

    if (requireExpiryDate && !expiryDate) {
      errors.expiryDate = it('validation.expiryDateRequired')
    }

    if (issueDate && expiryDate && issueDate > expiryDate) {
      errors.issueDate = it('validation.issueDateAfterExpiry')
      errors.expiryDate = it('validation.expiryDateBeforeIssue')
    }

    return errors
  }

  function clearFieldError(field: keyof IdentificationFieldErrors) {
    setFieldErrors((previous) => {
      const next = { ...previous }

      delete next[field]

      return next
    })
  }

  function update<K extends keyof Identification>(
    field: K,
    value: Identification[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setSubmitError(null)

    if (
      field === 'type' ||
      field === 'identificationNumber' ||
      field === 'expiryDate'
    ) {
      clearFieldError(field)
    }
  }

  // const formInvalid =
  //   !type ||
  //   !identificationNumber ||
  //   (requireExpiryDate && !form.expiryDate?.trim())

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitError(ct('validation.correctHighlightedFields'))
      return
    }

    setFieldErrors({})
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,

        id: form.id || createClientId('identification'),

        identificationNumber: form.identificationNumber.trim(),

        issueDate: form.issueDate?.trim() || null,
        expiryDate: form.expiryDate?.trim() || null,

        sponsor: form.sponsor?.trim() || null,
        issuingAuthority: form.issuingAuthority?.trim() || null,
        occupation: form.occupation?.trim() || null,

        fileId: form.fileId || null,
      })

      onOpenChange(false)
    } catch (error: unknown) {
      setSubmitError(
        getApiErrorMessage(error, {
          validationFailed: ct('errors.validationFailed'),
          requestFailed: ct('errors.requestFailed'),
          unexpectedError: ct('errors.unexpected'),
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='grid gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('idType')}</Label>
              <Select
                value={type}
                disabled={lockType}
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
              <Label htmlFor='identification-number'>{it('number')}</Label>

              <Input
                id='identification-number'
                className='h-11'
                value={form.identificationNumber}
                aria-invalid={Boolean(fieldErrors.identificationNumber)}
                aria-describedby={
                  fieldErrors.identificationNumber
                    ? 'identification-number-error'
                    : undefined
                }
                onChange={(event) =>
                  update('identificationNumber', event.target.value)
                }
              />

              {fieldErrors.identificationNumber && (
                <p
                  id='identification-number-error'
                  className='text-sm font-medium text-destructive'
                >
                  {fieldErrors.identificationNumber}
                </p>
              )}
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
              <Label htmlFor='identification-issue-date'>
                {it('issueDate')}
              </Label>

              {/* <Input
                id='identification-issue-date'
                type='date'
                className='h-11'
                value={form.issueDate || ''}
                aria-invalid={Boolean(fieldErrors.issueDate)}
                aria-describedby={
                  fieldErrors.issueDate
                    ? 'identification-issue-date-error'
                    : undefined
                }
                onChange={(event) => {
                  const value = event.target.value

                  clearFieldError('issueDate')
                  clearFieldError('expiryDate')
                  setSubmitError(null)

                  if (!value) {
                    setForm((previous) => ({
                      ...previous,
                      issueDate: null,
                      issueDateHijri: null,
                    }))

                    return
                  }

                  const hijriConverted = new DateObject({
                    date: value,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((previous) => ({
                    ...previous,
                    issueDate: value,
                    issueDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              /> */}
              <DatePicker
                id='identification-issue-date'
                value={form.issueDate}
                onChange={(value) => {
                  clearFieldError('issueDate')
                  clearFieldError('expiryDate')
                  setSubmitError(null)

                  if (!value) {
                    setForm((previous) => ({
                      ...previous,
                      issueDate: null,
                      issueDateHijri: null,
                    }))

                    return
                  }

                  const hijriConverted = new DateObject({
                    date: value,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((previous) => ({
                    ...previous,
                    issueDate: value,
                    issueDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              />

              {fieldErrors.issueDate && (
                <p
                  id='identification-issue-date-error'
                  className='text-sm font-medium text-destructive'
                >
                  {fieldErrors.issueDate}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='identification-expiry-date'>
                {it('expiryDate')}
              </Label>

              {/* <Input
                id='identification-expiry-date'
                type='date'
                className='h-11'
                value={form.expiryDate || ''}
                aria-invalid={Boolean(fieldErrors.expiryDate)}
                aria-describedby={
                  fieldErrors.expiryDate
                    ? 'identification-expiry-date-error'
                    : undefined
                }
                onChange={(event) => {
                  const value = event.target.value

                  clearFieldError('issueDate')
                  clearFieldError('expiryDate')
                  setSubmitError(null)

                  if (!value) {
                    setForm((previous) => ({
                      ...previous,
                      expiryDate: null,
                      expiryDateHijri: null,
                    }))

                    return
                  }

                  const hijriConverted = new DateObject({
                    date: value,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((previous) => ({
                    ...previous,
                    expiryDate: value,
                    expiryDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              /> */}

              <DatePicker
                id='identification-expiry-date'
                value={form.expiryDate}
                onChange={(value) => {
                  clearFieldError('issueDate')
                  clearFieldError('expiryDate')
                  setSubmitError(null)

                  if (!value) {
                    setForm((previous) => ({
                      ...previous,
                      expiryDate: null,
                      expiryDateHijri: null,
                    }))

                    return
                  }

                  const hijriConverted = new DateObject({
                    date: value,
                    calendar: gregorian,
                    format: 'YYYY-MM-DD',
                  })
                    .convert(arabic)
                    .format('YYYY-MM-DD')

                  setForm((previous) => ({
                    ...previous,
                    expiryDate: value,
                    expiryDateHijri: hijriConverted,
                    dateCalendar: 'gregorian',
                  }))
                }}
              />

              {fieldErrors.expiryDate && (
                <p
                  id='identification-expiry-date-error'
                  className='text-sm font-medium text-destructive'
                >
                  {fieldErrors.expiryDate}
                </p>
              )}
            </div>

            {form.type === 'iqama' && (
              <>
                <div className='space-y-2'>
                  <Label>{it('sponsor')}</Label>
                  <Input
                    className='h-11'
                    value={form.sponsor ?? ''}
                    onChange={(e) => update('sponsor', e.target.value || null)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>{it('occupation')}</Label>
                  <Input
                    className='h-11'
                    value={form.occupation ?? ''}
                    onChange={(e) =>
                      update('occupation', e.target.value || null)
                    }
                  />
                </div>
              </>
            )}

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

            <div className='flex items-center gap-2 pt-8'>
              <Checkbox
                checked={form.isCurrent}
                disabled={lockCurrent}
                onCheckedChange={(v) => update('isCurrent', Boolean(v))}
              />
              <Label>{ct('current')}</Label>
            </div>
          </div>
        </section>
        {submitError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />

            <AlertTitle>{it('errors.saveFailedTitle')}</AlertTitle>

            <AlertDescription className='whitespace-pre-line'>
              {submitError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Footer
        //onCancel={() => onOpenChange(false)}
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={submitLabel ?? it('saveIdentification')}
        //savingLabel={crt('saving', { item: 'board' })}
        //disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
  //const locale = useLocale()
  //const isRtl = locale === 'ar'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? pt('editPhoneNumberBtn') : pt('addPhoneNumberBtn')}
      description='Enter employee phone details.'
      //className='w-[95vw] max-w-7xl overflow-hidden p-0'
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const type = form.type.trim()
  const countryCode = form.countryCode.trim()
  const phoneNumber = form.phoneNumber.trim()

  function update<K extends keyof PhoneNumber>(
    field: K,
    value: PhoneNumber[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid = !type || !countryCode || !phoneNumber

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id || createClientId('phone'),
        extension: form.extension || null,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={pt('savePhone')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const type = form.type.trim()
  const email = form.email.trim()

  function update<K extends keyof Email>(field: K, value: Email[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid = !type || !email

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id || createClientId('email'),
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={emt('saveEmail')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const addressType = form.addressType.trim()
  const city = form.city.trim()
  const district = form.district.trim()
  const street = form.street.trim()
  const postalCode = form.postalCode.trim()

  function update<K extends keyof Address>(field: K, value: Address[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid =
    !addressType || !city || !district || !street || !postalCode

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id || createClientId('address'),
        building: form.building || null,
        additionalNumber: form.additionalNumber || null,
        stateProvince: form.stateProvince || null,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={at('saveAddress')}
        //savingLabel={crt('saving', { item: 'board' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
  //const locale = useLocale()
  //const isRtl = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)

  const firstNameEn = form.firstNameEn.trim()
  const familyNameEn = form.familyNameEn.trim()
  const firstNameAr = form.firstNameAr.trim()
  const familyNameAr = form.familyNameAr.trim()

  function update<K extends keyof Dependent>(field: K, value: Dependent[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid =
    !firstNameEn || !familyNameEn || !firstNameAr || !familyNameAr

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
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
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
              {/* <Label>{dt('dateOfBirth')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.dateOfBirth ?? ''}
                onChange={(e) => update('dateOfBirth', e.target.value || null)}
              /> */}
              <label
                htmlFor={'dateOfBirth'}
                className='text-xs text-muted-foreground block'
              >
                {dt('dateOfBirth')}
              </label>

              <DatePicker
                id='dateOfBirth'
                value={form.dateOfBirth}
                onChange={(value) => update('dateOfBirth', value)}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={dt('save')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const name = form.name.trim()
  const relationship = form.relationship.trim()
  const mobile = form.mobile?.trim()

  function update<K extends keyof EmergencyContact>(
    field: K,
    value: EmergencyContact[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid = !name || !relationship || !mobile

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id || createClientId('emergency-contact'),
        relationship: form.relationship || null,
        mobile: form.mobile || null,
        alternateMobile: form.alternateMobile || null,
        address: form.address || null,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
                  <SelectItem value='father'>{ect('father')}</SelectItem>
                  <SelectItem value='mother'>{ect('mother')}</SelectItem>
                  <SelectItem value='spouse'>{ect('spouse')}</SelectItem>
                  <SelectItem value='child'>{ect('child')}</SelectItem>
                  <SelectItem value='sibling'>{ect('sibling')}</SelectItem>
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
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={ect('saveEmergencyContact')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
  // const locale = useLocale()
  // const isRtl = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)

  const visaNumber = form.visaNumber.trim()

  function update<K extends keyof Visa>(field: K, value: Visa[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formInvalid = !visaNumber

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id || createClientId('visa'),
        visaType: form.visaType || undefined,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        fileId: form.fileId || null,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
              {/* <Label>{vt('issueDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.issueDate ?? ''}
                onChange={(e) => update('issueDate', e.target.value || null)}
              /> */}
              <label
                htmlFor={'issueDate'}
                className='text-xs text-muted-foreground block'
              >
                {vt('issueDate')}
              </label>

              <DatePicker
                id='issueDate'
                value={form.issueDate}
                onChange={(value) => update('issueDate', value)}
              />
            </div>

            <div className='space-y-2'>
              {/* <Label>{vt('expiryDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value || null)}
              /> */}
              <label
                htmlFor={'expiryDate'}
                className='text-xs text-muted-foreground block'
              >
                {vt('expiryDate')}
              </label>

              <DatePicker
                id='expiryDate'
                value={form.expiryDate}
                onChange={(value) => update('expiryDate', value)}
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
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={vt('saveVisa')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
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
