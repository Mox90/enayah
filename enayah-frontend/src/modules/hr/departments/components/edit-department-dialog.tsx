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
  const updateDepartment = useUpdateDepartment()

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
      title='Edit Department'
      description='Update department details'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormInput control={form.control} name='code' label='Code' />

          <FormInput
            control={form.control}
            name='nameEn'
            label='English Name'
          />

          <FormInput control={form.control} name='nameAr' label='Arabic Name' />

          <FormSubmitButton
            isLoading={updateDepartment.isPending}
            label='Update'
            loadingLabel='Updating...'
          />
        </form>
      </Form>
    </FormDialog>
  )
}
