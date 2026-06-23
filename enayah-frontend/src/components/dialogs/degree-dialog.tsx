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
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>
          {initialValue
            ? t.rich('update', { item: isRtl ? 'شهادة' : 'Degree' })
            : t.rich('add', { item: isRtl ? 'شهادة' : 'Degree' })}
        </DialogTitle>
        <DialogDescription>
          {t.rich('dialogDes', {
            item: isRtl
              ? `المؤهلات التعليمية للموظف`
              : `employee's educational qualification`,
          })}
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>{t('degreeNameLabel')}</Label>
          <Input
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='diploma'
              >
                {t('diploma')}
              </SelectItem>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='associate'
              >
                {t('associate')}
              </SelectItem>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='bachelor'
              >
                {t('bachelor')}
              </SelectItem>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='master'
              >
                {t('master')}
              </SelectItem>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='doctorate'
              >
                {t('doctorate')}
              </SelectItem>
              <SelectItem
                className={
                  isRtl ? 'justify-start text-right' : 'justify-end text-left'
                }
                value='other'
              >
                {t('other')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{t('major')}</Label>
          <Input
            value={form.major ?? ''}
            onChange={(e) => update('major', e.target.value || null)}
            placeholder={t('majorPlaceHolder')}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('institutionNameLabel')}</Label>
          <Input
            value={form.institution}
            onChange={(e) => update('institution', e.target.value)}
            placeholder={t('institutionPlaceHolder')}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('graduationDateLabel')}</Label>
          <Input
            type='date'
            value={form.graduationDate ?? ''}
            onChange={(e) => update('graduationDate', e.target.value || null)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          {t('cancel')}
        </Button>

        <Button type='button' onClick={handleSubmit}>
          {t.rich('save', { item: isRtl ? 'شهادة' : 'Degree' })}
        </Button>
      </DialogFooter>
    </DialogContent>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DegreeDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </Dialog>
  )
}
