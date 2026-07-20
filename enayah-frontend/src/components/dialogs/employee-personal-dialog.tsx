'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmployeeProfile } from '@/modules/hr/employees/types/employee-profile.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'
// import { EmployeeProfile } from '../../types/employee-profile.types'

type PersonalFormValue = {
  firstNameEn: string
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn: string
  firstNameAr: string
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr: string
  gender: 'male' | 'female'
  dateOfBirth?: string | null
  countryId?: string | null
  version: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: EmployeeProfile
  onSubmit: (value: PersonalFormValue) => void | Promise<void>
}

function getInitialForm(profile: EmployeeProfile): PersonalFormValue {
  const p = profile.personal

  //console.log('Received version is: ' + p.version)

  return {
    firstNameEn: p.firstNameEn ?? '',
    secondNameEn: p.secondNameEn ?? '',
    thirdNameEn: p.thirdNameEn ?? '',
    familyNameEn: p.familyNameEn ?? '',
    firstNameAr: p.firstNameAr ?? '',
    secondNameAr: p.secondNameAr ?? '',
    thirdNameAr: p.thirdNameAr ?? '',
    familyNameAr: p.familyNameAr ?? '',
    gender: p.gender ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    countryId: p.nationality?.id ?? null,
    version: p.version,
  }
}

export function EmployeePersonalDialog({
  open,
  onOpenChange,
  profile,
  onSubmit,
}: Props) {
  //const p = profile.personal
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const et = useTranslations('employees')

  const [form, setForm] = useState<PersonalFormValue>(() =>
    getInitialForm(profile),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstNameEn = form.firstNameEn.trim()
  const familyNameEn = form.familyNameEn.trim()
  const firstNameAr = form.firstNameAr.trim()
  const familyNameAr = form.familyNameAr.trim()
  const dateOfBirth = form.dateOfBirth?.trim()

  function update<K extends keyof PersonalFormValue>(
    key: K,
    value: PersonalFormValue[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const formInvalid =
    !firstNameEn ||
    !familyNameEn ||
    !firstNameAr ||
    !familyNameAr ||
    !dateOfBirth

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
        secondNameEn: form.secondNameEn || null,
        thirdNameEn: form.thirdNameEn || null,
        secondNameAr: form.secondNameAr || null,
        thirdNameAr: form.thirdNameAr || null,
        dateOfBirth: form.dateOfBirth || null,
      })

      onOpenChange(false)
    } catch (error) {
      // keep dialog open; error is surfaced via mutation onError
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDialog
      open={open}
      //open={closeDialog}
      onOpenChange={onOpenChange}
      title={et('editPersonalInfo')}
      description={et('editPersonalInfoSub')}
      // 1. Set a responsive max-height (max-h-[90vh]) instead of leaving it unconstrained
      className='w-[95vw] max-w-4xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {/* 2. Wrap the form sections in a scrollable container with overflow-y-auto */}
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {et('englishName')}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {et('englishNameSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('firstNameEn')}</Label>
              <Input
                className='h-11'
                value={form.firstNameEn}
                onChange={(e) => update('firstNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('secondNameEn')}</Label>
              <Input
                className='h-11'
                value={form.secondNameEn ?? ''}
                onChange={(e) => update('secondNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('thirdNameEn')}</Label>
              <Input
                className='h-11'
                value={form.thirdNameEn ?? ''}
                onChange={(e) => update('thirdNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('familyNameEn')}</Label>
              <Input
                className='h-11'
                value={form.familyNameEn}
                onChange={(e) => update('familyNameEn', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {et('arabicName')}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {et('arabicNameSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('familyNameAr')}</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.familyNameAr}
                onChange={(e) => update('familyNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('secondNameAr')}</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.secondNameAr ?? ''}
                onChange={(e) => update('secondNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('thirdNameAr')}</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.thirdNameAr ?? ''}
                onChange={(e) => update('thirdNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('firstNameAr')}</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.firstNameAr}
                onChange={(e) => update('firstNameAr', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('gender')}</Label>

              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={form.gender}
                onValueChange={(v) => update('gender', v as 'male' | 'female')}
              >
                <SelectTrigger className='h-11 bg-background'>
                  <SelectValue placeholder={et('gender')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='male'>{et('male')}</SelectItem>
                  <SelectItem value='female'>{et('female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{et('dateOfBirth')}</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.dateOfBirth ?? ''}
                onChange={(e) => update('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* 3. Ensure the footer remains fixed at the bottom and doesn't shrink */}
      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={et('savePersonalInfo')}
        savingLabel={et('saving', { item: 'personal information' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
    </FormDialog>
  )
}
