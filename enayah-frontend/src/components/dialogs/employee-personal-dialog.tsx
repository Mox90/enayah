'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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

  function update<K extends keyof PersonalFormValue>(
    key: K,
    value: PersonalFormValue[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
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
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Personal Information'
      description="Update the employee's English and Arabic personal details."
      // 1. Set a responsive max-height (max-h-[90vh]) instead of leaving it unconstrained
      className='w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {/* 2. Wrap the form sections in a scrollable container with overflow-y-auto */}
      <div className='flex-1 overflow-y-auto space-y-6 px-6 py-6'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              English Name
            </h3>
            <p className='text-xs text-muted-foreground'>
              Official English name as shown in HR records.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>First Name EN</Label>
              <Input
                className='h-11'
                value={form.firstNameEn}
                onChange={(e) => update('firstNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Second Name EN</Label>
              <Input
                className='h-11'
                value={form.secondNameEn ?? ''}
                onChange={(e) => update('secondNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Third Name EN</Label>
              <Input
                className='h-11'
                value={form.thirdNameEn ?? ''}
                onChange={(e) => update('thirdNameEn', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Family Name EN</Label>
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
              Arabic Name
            </h3>
            <p className='text-xs text-muted-foreground'>
              Official Arabic name as shown in HR records.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Family Name AR</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.familyNameAr}
                onChange={(e) => update('familyNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Second Name AR</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.secondNameAr ?? ''}
                onChange={(e) => update('secondNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Third Name AR</Label>
              <Input
                dir='rtl'
                className='h-11 text-right'
                value={form.thirdNameAr ?? ''}
                onChange={(e) => update('thirdNameAr', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>First Name AR</Label>
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
              <Label>Date of Birth</Label>
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
      <DialogFooter className='border-t bg-muted/40 px-6 py-8'>
        <Button
          className='p-4'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>

        <Button
          className='p-4 bg-slate-950 text-white hover:bg-slate-800'
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </FormDialog>
  )
}
