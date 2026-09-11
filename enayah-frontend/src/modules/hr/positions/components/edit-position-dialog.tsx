// enayah-frontend/src/modules/hr/positions/components/edit-position-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'

import { Footer } from '@/components/footer/footer'
import { FormDialog, FormInput } from '@/components/forms'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useUpdatePosition } from '../hooks/use-update-position'
import {
  createPositionSchema,
  type CreatePositionFormValues,
} from '../schemas/position.schema'
import type { Position } from '../types/position.types'
import {
  getPositionCategoryCode,
  type PositionWorkforceCategory,
} from '../utils/position-workforce-category'

interface Props {
  position: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SectionProps {
  title: string
  description?: string
  badge?: string
  children: ReactNode
}

interface ReadOnlyFieldProps {
  label: string
  value?: ReactNode
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function Section({ title, description, badge, children }: SectionProps) {
  return (
    <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
      <div className='border-b bg-muted/20 px-5 py-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold tracking-tight'>{title}</h3>

            {description && (
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            )}
          </div>

          {badge && (
            <span className='shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className='p-5'>{children}</div>
    </section>
  )
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className='min-w-0 rounded-lg border bg-muted/20 px-3 py-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>

      <div className='mt-1 truncate text-sm font-semibold'>
        {hasValue ? value : '—'}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

const EditPositionDialog = ({ position, open, onOpenChange }: Props) => {
  const t = useTranslations('positions')

  const updatePosition = useUpdatePosition()

  const form = useForm<CreatePositionFormValues>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      titleEn: position.titleEn,
      titleAr: position.titleAr ?? undefined,
      gradeId: position.gradeId ?? undefined,
      workforceCategory: position.workforceCategory ?? undefined,
      categoryCode: position.categoryCode ?? undefined,
    },
  })

  /* ------------------------------------------------------------------------ */
  /* Reset form when position changes                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      titleEn: position.titleEn,
      titleAr: position.titleAr ?? undefined,
      gradeId: position.gradeId ?? undefined,
      workforceCategory: position.workforceCategory ?? undefined,
      categoryCode: position.categoryCode ?? undefined,
    })
  }, [
    open,
    position.id,
    position.titleEn,
    position.titleAr,
    position.gradeId,
    position.workforceCategory,
    position.categoryCode,
    form,
  ])

  const workforceCategory = form.watch('workforceCategory')
  const categoryCode = form.watch('categoryCode')

  const isSaving = updatePosition.isPending

  const categoryOptions: {
    value: PositionWorkforceCategory
    code: number
    label: string
  }[] = [
    {
      value: 'physician',
      code: 1000,
      label: t('categoryPhysician'),
    },
    {
      value: 'nurse',
      code: 2000,
      label: t('categoryNurse'),
    },
    {
      value: 'allied_health',
      code: 3000,
      label: t('categoryAlliedHealth'),
    },
    {
      value: 'administrative',
      code: 4000,
      label: t('categoryAdministrative'),
    },
    {
      value: 'support_service',
      code: 5000,
      label: t('categorySupportService'),
    },
  ]

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const onSubmit = async (values: CreatePositionFormValues) => {
    try {
      await updatePosition.mutateAsync({
        id: position.id,
        data: values,
      })

      onOpenChange(false)
    } catch {
      /*
       * Error toast is handled by useUpdatePosition.
       *
       * Keep the dialog open so HR can review/correct
       * the entered position information.
       */
    }
  }

  function resetForm() {
    form.reset({
      titleEn: position.titleEn,
      titleAr: position.titleAr ?? undefined,
      gradeId: position.gradeId ?? undefined,
      workforceCategory: position.workforceCategory ?? undefined,
      categoryCode: position.categoryCode ?? undefined,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return
    }

    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  function closeDialog() {
    handleOpenChange(false)
  }

  function submitForm() {
    void form.handleSubmit(onSubmit)()
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('editPosition')}
      description={t('editPositionSub')}
      className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-2xl md:w-[70vw] md:max-w-3xl'
      headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      <Form {...form}>
        <div className='flex min-h-0 flex-1 flex-col'>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'
          >
            {/* ------------------------------------------------------------ */}
            {/* Position Information                                         */}
            {/* ------------------------------------------------------------ */}

            <Section
              title={t('positionInformation')}
              description={t('positionInformationSub')}
            >
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <FormInput
                  control={form.control}
                  name='titleEn'
                  label={t('englishTitle')}
                />

                <FormInput
                  control={form.control}
                  name='titleAr'
                  label={t('arabicTitle')}
                />
              </div>
            </Section>

            {/* ------------------------------------------------------------ */}
            {/* Workforce Classification                                     */}
            {/* ------------------------------------------------------------ */}

            <Section
              title={t('workforceClassification')}
              description={t('workforceClassificationSub')}
            >
              <div className='space-y-5'>
                <FormField
                  control={form.control}
                  name='workforceCategory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('workforceCategory')}

                        <span className='ms-1 text-destructive'>*</span>
                      </FormLabel>

                      <Select
                        value={field.value ?? undefined}
                        onValueChange={(value) => {
                          const category = value as PositionWorkforceCategory

                          field.onChange(category)

                          /*
                           * Category code is controlled by the
                           * selected workforce category.
                           */
                          form.setValue(
                            'categoryCode',
                            getPositionCategoryCode(category),
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          )
                        }}
                      >
                        <SelectTrigger className='w-full data-[size=default]:h-11'>
                          <SelectValue
                            placeholder={t('selectWorkforceCategory')}
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className='flex items-center gap-3'>
                                <span>{option.label}</span>

                                <span className='text-xs tabular-nums text-muted-foreground'>
                                  {option.code}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <input
                  type='hidden'
                  {...form.register('categoryCode', {
                    valueAsNumber: true,
                  })}
                />

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <ReadOnlyField
                    label={t('categoryCode')}
                    value={
                      categoryCode ? (
                        <span className='tabular-nums'>{categoryCode}</span>
                      ) : null
                    }
                  />

                  <ReadOnlyField
                    label={t('classificationStatus')}
                    value={
                      workforceCategory ? (
                        <span className='inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                          {t('systemDefined')}
                        </span>
                      ) : null
                    }
                  />
                </div>

                <div className='rounded-lg border border-dashed bg-muted/10 px-4 py-3'>
                  <p className='text-xs leading-relaxed text-muted-foreground'>
                    {t('workforceClassificationHelp')}
                  </p>
                </div>
              </div>
            </Section>
          </form>

          {/* -------------------------------------------------------------- */}
          {/* Footer                                                         */}
          {/* -------------------------------------------------------------- */}

          <Footer
            onCancel={closeDialog}
            onSave={submitForm}
            label={t('update')}
            savingLabel={t('updating')}
            disabled={isSaving}
            isSaving={isSaving}
            saveVariant='default'
            saveIcon={<Save className='size-4' />}
          />
        </div>
      </Form>
    </FormDialog>
  )
}

export default EditPositionDialog
