'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createDepartmentSchema,
  CreateDepartmentFormValues,
} from '../schemas/department.schema'
import { Form } from '@/components/ui/form'
import { FormDialog, FormInput, FormSubmitButton } from '@/components/forms'
import { FormCombobox } from '@/components/forms/form-combobox'
import { Button } from '@/components/ui/button'
import { useCreateDepartment } from '../hooks/use-create-department'
import { useDepartments } from '../hooks/use-departments'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function CreateDepartmentDialog() {
  const [open, setOpen] = useState(false)

  const createDepartment = useCreateDepartment()

  const { data: departmentsResponse } = useDepartments({
    page: 1,
    limit: 100,
    search: '',
    sortBy: 'nameEn',
    sortOrder: 'asc',
  })

  const t = useTranslations('departments')
  const locale = useLocale()

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      code: '',
      nameEn: '',
      nameAr: '',
      parentDepartmentId: undefined,
    },
  })

  const onSubmit = async (values: CreateDepartmentFormValues) => {
    await createDepartment.mutateAsync(values)
    form.reset()
    setOpen(false)
  }

  const departments = departmentsResponse?.data ?? []

  const departmentOptions = departments.map(
    (department: { id: string; nameEn: string; nameAr: string }) => ({
      label: locale === 'ar' ? department.nameAr : department.nameEn,
      value: department.id,
    }),
  )

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('createDepartment')}</Button>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={t('createDepartment')}
        description={t('createDepartment')}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormInput control={form.control} name='code' label={t('code')} />

            <FormInput
              control={form.control}
              name='nameEn'
              label={t('englishName')}
            />

            <FormInput
              control={form.control}
              name='nameAr'
              label={t('arabicName')}
            />

            <FormCombobox
              control={form.control}
              name='parentDepartmentId'
              label={t('parentDepartment')}
              options={departmentOptions}
              placeholder={t('selectParentDepartment')}
              searchPlaceholder={t('searchDepartment')}
              emptyMessage={t('noDepartmentFound')}
            />

            <FormSubmitButton
              isLoading={createDepartment.isPending}
              label={t('create')}
              loadingLabel={t('creating')}
            />
          </form>
        </Form>
      </FormDialog>
    </>
  )
}
