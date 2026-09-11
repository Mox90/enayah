// enayah-frontend/src/modules/hr/positions-items/components/create-position-item-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'

import { Footer } from '@/components/footer/footer'
import { FormDialog, FormInput } from '@/components/forms'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import {
  PositionCombobox,
  type PositionWorkforceCategory,
} from '@/modules/hr/positions/components/position-combobox'

import { useCreatePositionItem } from '../hooks/use-create-position-item'
import {
  createPositionItemSchema,
  type CreateJobPositionItemFormValues,
} from '../schemas/position.items.schema'

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

export function CreatePositionItemDialog() {
  const [open, setOpen] = useState(false)

  const [departmentLabel, setDepartmentLabel] = useState<string | null>(null)

  const [positionLabel, setPositionLabel] = useState<string | null>(null)

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('positionItems')
  const et = useTranslations('employees')

  const createPositionItem = useCreatePositionItem()

  const form = useForm<CreateJobPositionItemFormValues>({
    resolver: zodResolver(createPositionItemSchema),

    defaultValues: {
      itemNumber: '',
      departmentId: '',
      positionId: '',
      workforceCategory: undefined,
      categoryCode: undefined,
      minSalary: undefined,
      maxSalary: undefined,
      status: 'vacant',
    },
  })

  const workforceCategory = form.watch('workforceCategory')

  const categoryCode = form.watch('categoryCode')

  const status = form.watch('status')

  const isSaving = createPositionItem.isPending

  function resetForm() {
    form.reset({
      itemNumber: '',
      departmentId: '',
      positionId: '',
      workforceCategory: undefined,
      categoryCode: undefined,
      minSalary: undefined,
      maxSalary: undefined,
      status: 'vacant',
    })

    setDepartmentLabel(null)
    setPositionLabel(null)
  }

  const onSubmit = async (values: CreateJobPositionItemFormValues) => {
    try {
      await createPositionItem.mutateAsync(values)

      resetForm()
      setOpen(false)
    } catch {
      /*
       * Toast handled by mutation hook.
       */
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return
    }

    if (!nextOpen) {
      resetForm()
    }

    setOpen(nextOpen)
  }

  function submitForm() {
    void form.handleSubmit(onSubmit)()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className='me-2 size-4' />

        {t('createPositionItem')}
      </Button>

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t('createPositionItem')}
        description={t('createPositionItemSub')}
        className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:w-[80vw] md:max-w-4xl'
        headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
      >
        <Form {...form}>
          <div className='flex min-h-0 flex-1 flex-col'>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'
            >
              <Section
                title={t('positionItemInformation')}
                description={t('positionItemInformationSub')}
              >
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                  <FormInput
                    control={form.control}
                    name='itemNumber'
                    label={t('itemNumber')}
                  />

                  <ReadOnlyField label={t('status')} value={t(status)} />
                </div>
              </Section>

              <Section
                title={t('organizationalAssignment')}
                description={t('organizationalAssignmentSub')}
              >
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='departmentId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('departmentTitle')}
                          <span className='ms-1 text-destructive'>*</span>
                        </FormLabel>

                        <DepartmentCombobox
                          value={field.value || null}
                          selectedLabel={departmentLabel}
                          onChange={(department) => {
                            field.onChange(department.id)

                            setDepartmentLabel(
                              isRtl
                                ? (department.nameAr ?? department.nameEn)
                                : department.nameEn,
                            )
                          }}
                        />

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='positionId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('positionTitle')}
                          <span className='ms-1 text-destructive'>*</span>
                        </FormLabel>

                        <PositionCombobox
                          value={field.value || null}
                          selectedLabel={positionLabel}
                          onChange={(position) => {
                            field.onChange(position.id)

                            setPositionLabel(
                              isRtl
                                ? (position.titleAr ?? position.titleEn)
                                : position.titleEn,
                            )

                            if (
                              !position.workforceCategory ||
                              !position.categoryCode
                            ) {
                              form.setError('positionId', {
                                type: 'manual',
                                message: t('positionClassificationRequired'),
                              })

                              form.setValue('workforceCategory', undefined)

                              form.setValue('categoryCode', undefined)

                              return
                            }

                            form.clearErrors('positionId')

                            form.setValue(
                              'workforceCategory',
                              position.workforceCategory as PositionWorkforceCategory,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )

                            form.setValue(
                              'categoryCode',
                              position.categoryCode,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }}
                        />

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              <Section
                title={t('workforceClassification')}
                description={t('workforceClassificationSub')}
              >
                <input type='hidden' {...form.register('workforceCategory')} />

                <input
                  type='hidden'
                  {...form.register('categoryCode', {
                    valueAsNumber: true,
                  })}
                />

                <input type='hidden' {...form.register('status')} />

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <ReadOnlyField
                    label={t('workforceCategory')}
                    value={workforceCategory ? et(workforceCategory) : null}
                  />

                  <ReadOnlyField
                    label={t('categoryCode')}
                    value={
                      categoryCode ? (
                        <span className='tabular-nums'>{categoryCode}</span>
                      ) : null
                    }
                  />

                  <ReadOnlyField
                    label={t('classificationSource')}
                    value={
                      workforceCategory ? (
                        <span className='inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                          {t('fromPosition')}
                        </span>
                      ) : null
                    }
                  />
                </div>
              </Section>

              <Section
                title={t('salaryRange')}
                description={t('salaryRangeSub')}
                badge={t('optional')}
              >
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='minSalary'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('minSalary')}</FormLabel>

                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          inputMode='decimal'
                          className='h-11'
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value

                            field.onChange(
                              value === '' ? undefined : Number(value),
                            )
                          }}
                        />

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maxSalary'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('maxSalary')}</FormLabel>

                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          inputMode='decimal'
                          className='h-11'
                          value={field.value ?? ''}
                          onChange={(event) => {
                            const value = event.target.value

                            field.onChange(
                              value === '' ? undefined : Number(value),
                            )
                          }}
                        />

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>
            </form>

            <Footer
              onCancel={() => handleOpenChange(false)}
              onSave={submitForm}
              label={t('create')}
              savingLabel={t('creating')}
              disabled={isSaving}
              isSaving={isSaving}
              saveVariant='default'
              saveIcon={<Plus className='size-4' />}
            />
          </div>
        </Form>
      </FormDialog>
    </>
  )
}
