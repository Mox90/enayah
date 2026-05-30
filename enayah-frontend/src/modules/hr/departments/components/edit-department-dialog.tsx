'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form } from '@/components/ui/form'
import { FormDialog, FormInput, FormSubmitButton } from '@/components/forms'
import { Department } from '../types/department.types'
import {
  createDepartmentSchema,
  CreateDepartmentFormValues,
} from '../schemas/department.schema'
import { useUpdateDepartment } from '../hooks/use-update-department'
import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { FormCombobox } from '@/components/forms/form-combobox'
import { useDepartments } from '../hooks/use-departments'

interface Props {
  department: Department
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDepartmentDialog({
  department,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations('departments')
  const locale = useLocale()

  const updateDepartment = useUpdateDepartment()

  const { data: departmentsResponse } = useDepartments({
    page: 1,
    limit: 100,
    search: '',
    sortBy: 'nameEn',
    sortOrder: 'asc',
  })

  const departments = departmentsResponse?.data ?? []

  const departmentOptions = departments
    .filter((d: { id: string }) => d.id !== department.id)
    .map((department: { id: string; nameEn: string; nameAr: string }) => ({
      label: locale === 'ar' ? department.nameAr : department.nameEn,
      value: department.id,
    }))

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId ?? undefined,
    },
  })

  useEffect(() => {
    form.reset({
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId ?? undefined,
    })
  }, [department, form])

  const onSubmit = async (values: CreateDepartmentFormValues) => {
    await updateDepartment.mutateAsync({
      id: department.id,
      data: values,
    })

    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editDepartment')}
      description={t('editDepartmentSub')}
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
            isLoading={updateDepartment.isPending}
            label={t('update')}
            loadingLabel={t('updating')}
          />
        </form>
      </Form>
    </FormDialog>
  )
}
