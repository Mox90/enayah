'use client'

import { useState } from 'react'

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
import { useLocale, useTranslations } from 'next-intl'
import { FormDialog } from '../forms'
import { Footer } from '../footer/footer'
import { Save } from 'lucide-react'

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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const degreeName = form.degreeName.trim()
  const institution = form.institution.trim()

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

  const formInvalid = !degreeName || !institution

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
        id: form.id ?? (generateId ? createClientId() : undefined),
        major: form.major || null,
        graduationDate: form.graduationDate || null,
      })
      //console.log('DATA INPUT IS ', form)
      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation hook can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
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
            <p className='text-xs text-muted-foreground'>{t('degreeSub')}</p>
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

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={t('save', {
          item: isRtl ? 'التحصيل العلمي' : 'Educational Attainment',
        })}
        savingLabel={t('saving', { item: 'educational attainment' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
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
  const t = useTranslations('credentials')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? t('editDegree') : t('addDegree')}
      description={t('educationSub')}
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
