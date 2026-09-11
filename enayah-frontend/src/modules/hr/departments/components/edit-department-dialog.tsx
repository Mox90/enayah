// enayah-frontend/src/modules/hr/departments/components/edit-department-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
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

import { useDepartmentLookup } from '../hooks/use-department-lookup'
import { useUpdateDepartment } from '../hooks/use-update-department'
import {
  createDepartmentSchema,
  type CreateDepartmentFormValues,
} from '../schemas/department.schema'
import type { Department } from '../types/department.types'

import { DepartmentCombobox } from './department-combobox'

interface Props {
  department: Department
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SectionProps {
  title: string
  description?: string
  badge?: string
  children: ReactNode
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
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

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export function EditDepartmentDialog({
  department,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations('departments')
  const c = useTranslations('common')
  const locale = useLocale()

  const updateDepartment = useUpdateDepartment()

  /*
   * Lookup is used only to resolve the current parent's display label.
   *
   * DepartmentCombobox itself performs its own paginated/search lookup.
   */
  const { data: departmentsLookup = [] } = useDepartmentLookup()

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId ?? undefined,
    },
  })

  /* ------------------------------------------------------------------------ */
  /* Reset when another department is opened                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId ?? undefined,
    })
  }, [
    open,
    department.id,
    department.code,
    department.nameEn,
    department.nameAr,
    department.parentDepartmentId,
    form,
  ])

  /* ------------------------------------------------------------------------ */
  /* Parent department display                                               */
  /* ------------------------------------------------------------------------ */

  const parentDepartmentId = form.watch('parentDepartmentId')

  const selectedParentDepartment = departmentsLookup.find(
    (item) => item.id === parentDepartmentId,
  )

  const selectedParentLabel = selectedParentDepartment
    ? locale === 'ar'
      ? (selectedParentDepartment.nameAr ?? selectedParentDepartment.nameEn)
      : (selectedParentDepartment.nameEn ?? selectedParentDepartment.nameAr)
    : null

  const isSaving = updateDepartment.isPending

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const onSubmit = async (values: CreateDepartmentFormValues) => {
    try {
      await updateDepartment.mutateAsync({
        id: department.id,
        data: values,
      })

      onOpenChange(false)
    } catch {
      /*
       * Mutation hook handles the backend error toast.
       *
       * Keep the dialog open so HR can review/correct
       * the entered department information.
       */
    }
  }

  function resetForm() {
    form.reset({
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId ?? undefined,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    /*
     * Prevent accidental closing while the mutation
     * is being processed.
     */
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
      title={t('editDepartment')}
      description={t('editDepartmentSub')}
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
            {/* Department Information                                       */}
            {/* ------------------------------------------------------------ */}

            <Section
              title={t('departmentInformation')}
              description={t('departmentInformationSub')}
            >
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                {/* Department Code */}

                <div className='md:col-span-2 md:max-w-sm'>
                  <FormInput
                    control={form.control}
                    name='code'
                    label={t('code')}
                  />
                </div>

                {/* English Name */}

                <FormInput
                  control={form.control}
                  name='nameEn'
                  label={t('englishName')}
                />

                {/* Arabic Name */}

                <FormInput
                  control={form.control}
                  name='nameAr'
                  label={t('arabicName')}
                />
              </div>
            </Section>

            {/* ------------------------------------------------------------ */}
            {/* Organizational Hierarchy                                     */}
            {/* ------------------------------------------------------------ */}

            <Section
              title={t('departmentHierarchy')}
              description={t('departmentHierarchySub')}
              badge={c('optional')}
            >
              <FormField
                control={form.control}
                name='parentDepartmentId'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between gap-3'>
                      <FormLabel>{t('parentDepartment')}</FormLabel>

                      {/* Clear Parent */}

                      {field.value && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          disabled={isSaving}
                          className='h-7 px-2 text-xs text-muted-foreground hover:text-destructive'
                          onClick={() => field.onChange(undefined)}
                        >
                          <X className='me-1 size-3.5' />

                          {c('none')}
                        </Button>
                      )}
                    </div>

                    <DepartmentCombobox
                      value={field.value ?? null}
                      selectedLabel={selectedParentLabel}
                      /*
                       * A department cannot be selected
                       * as its own parent.
                       */
                      excludeIds={[department.id]}
                      onChange={(selectedDepartment) => {
                        field.onChange(selectedDepartment.id)
                      }}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
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
