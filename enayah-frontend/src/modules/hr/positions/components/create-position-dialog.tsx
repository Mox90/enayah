'use client'

import { useState } from 'react'
import { useCreatePosition } from '../hooks/use-create-position'
import { usePositions } from '../hooks/use-positions'
import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import {
  CreatePositionFormValues,
  createPositionSchema,
} from '../schemas/position.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormDialog, FormInput, FormSubmitButton } from '@/components/forms'
import { Form } from '@/components/ui/form'
import { FormCombobox } from '@/components/forms/form-combobox'

export function CreatePositionDialog() {
  const [open, setOpen] = useState(false)

  const createPosition = useCreatePosition()

  const { data: positionResponse } = usePositions({
    page: 1,
    limit: 100,
    search: '',
    sortBy: 'nameEn',
    sortOrder: 'asc',
  })

  const t = useTranslations('positions')
  const locale = useLocale()

  const form = useForm<CreatePositionFormValues>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      titleEn: '',
      titleAr: '',
      gradeId: undefined,
    },
  })

  const onSubmit = async (values: CreatePositionFormValues) => {
    await createPosition.mutateAsync(values)
    form.reset()
    setOpen(false)
  }

  const positions = positionResponse?.data ?? []

  const positionOptions = positions.map(
    (position: { id: string; titleEn: string; titleAr: string }) => ({
      label: locale === 'ar' ? position.titleAr : position.titleEn,
      value: position.id,
    }),
  )

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('createPosition')}</Button>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={t('createPosition')}
        description={t('createPosition')}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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

            {/* <FormCombobox
              control={form.control}
              name='gradeId'
              label={t('gradeId')}
              options={positionOptions}
              placeholder={t('selectGrade')}
              searchPlaceholder={t('searchGrade')}
              emptyMessage={t('noPositionFound')}
            /> */}

            <FormSubmitButton
              isLoading={createPosition.isPending}
              label={t('create')}
              loadingLabel={t('creating')}
            />
          </form>
        </Form>
      </FormDialog>
    </>
  )
}
