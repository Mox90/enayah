'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { FormDialog } from '../forms'

export type DegreeFormValue = {
  id?: string
  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'
  degreeName: string
  major?: string | null
  institution: string
  graduationDate?: string | null
  isVerified?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: DegreeFormValue | null
  onSubmit: (value: DegreeFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: DegreeFormValue = {
  degreeType: 'bachelor',
  degreeName: '',
  major: null,
  institution: '',
  graduationDate: null,
  isVerified: false,
}

function DegreeDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: DegreeFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: DegreeFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const t = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [form, setForm] = useState<DegreeFormValue>(initialValue ?? emptyValue)

  function update<K extends keyof DegreeFormValue>(
    field: K,
    value: DegreeFormValue[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function createClientId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `degree-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.degreeName.trim()) return
    if (!form.institution.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      major: form.major || null,
      graduationDate: form.graduationDate || null,
    })
    //console.log('DATA INPUT IS ', form)
    onOpenChange(false)
  }

  return (
    <>
      <div className='space-y-6 px-6 py-1 '>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {t('highestEducationalLabel')}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {t.rich('dialogDes', {
                item: isRtl
                  ? 'المؤهلات التعليمية للموظف'
                  : "employee's educational qualification",
              })}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2 xl:col-span-2'>
              <Label>{t('degreeNameLabel')}</Label>
              <Input
                className='h-11'
                value={form.degreeName}
                onChange={(e) => update('degreeName', e.target.value)}
                placeholder={t('degreePlaceHolder')}
              />
            </div>

            <div className='space-y-2'>
              <Label>{t('degreeTypeLabel')}</Label>
              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={form.degreeType}
                onValueChange={(v) =>
                  update('degreeType', v as DegreeFormValue['degreeType'])
                }
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='diploma'>{t('diploma')}</SelectItem>
                  <SelectItem value='associate'>{t('associate')}</SelectItem>
                  <SelectItem value='bachelor'>{t('bachelor')}</SelectItem>
                  <SelectItem value='master'>{t('master')}</SelectItem>
                  <SelectItem value='doctorate'>{t('doctorate')}</SelectItem>
                  <SelectItem value='other'>{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('major')}</Label>
              <Input
                className='h-11'
                value={form.major ?? ''}
                onChange={(e) => update('major', e.target.value || null)}
                placeholder={t('majorPlaceHolder')}
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>{t('institutionNameLabel')}</Label>
              <Input
                className='h-11'
                value={form.institution}
                onChange={(e) => update('institution', e.target.value)}
                placeholder={t('institutionPlaceHolder')}
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {t('graduationDateLabel')}
            </h3>
            <p className='text-xs text-muted-foreground'>
              Graduation or completion date, if available.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{t('graduationDateLabel')}</Label>
              <Input
                type='date'
                className='h-11 bg-background'
                value={form.graduationDate ?? ''}
                onChange={(e) =>
                  update('graduationDate', e.target.value || null)
                }
              />
            </div>
          </div>
        </section>
      </div>

      <DialogFooter className='border-t bg-muted/40 px-6 py-6'>
        <Button
          type='button'
          className='p-4'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          {t('cancel')}
        </Button>

        <Button
          type='button'
          className='bg-slate-950 p-4 text-white hover:bg-slate-800'
          onClick={handleSubmit}
        >
          {t.rich('save', { item: isRtl ? 'شهادة' : 'Degree' })}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DegreeDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-degree' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? 'Edit Degree' : 'Add Degree'}
      description="Enter the employee's board qualification details."
      className='w-[95vw] max-w-10xl overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {open && (
        <DegreeDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </FormDialog>
  )
}
