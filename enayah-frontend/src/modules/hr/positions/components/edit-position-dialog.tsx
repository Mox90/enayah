'use client'

import React, { useEffect } from 'react'
import { Position } from '../types/position.types'
import { useTranslations } from 'next-intl'
import { useUpdatePosition } from '../hooks/use-update-position'
import { useForm } from 'react-hook-form'
import {
  CreatePositionFormValues,
  createPositionSchema,
} from '../schemas/position.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog, FormInput, FormSubmitButton } from '@/components/forms'
import { Form } from '@/components/ui/form'

interface Props {
  position: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EditPositionDialog = ({ position, open, onOpenChange }: Props) => {
  const t = useTranslations('positions')
  //const locale = useLocale()

  const updatePosition = useUpdatePosition()

  // const { data: positionsResponse } = usePositions({
  //   page: 1,
  //   limit: 100,
  //   search: '',
  //   sortBy: 'titleEn',
  //   sortOrder: 'asc',
  // })

  // const positions = positionsResponse?.data ?? []

  // const positionOptions = positions.map(
  //   (position: { id: string; titleEn: string; titleAr: string }) => ({
  //     label: locale === 'ar' ? position.titleAr : position.titleEn,
  //     value: position.id,
  //   }),
  // )

  const form = useForm<CreatePositionFormValues>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      titleEn: position.titleEn,
      titleAr: position.titleAr,
      gradeId: position.gradeId ?? undefined,
    },
  })

  useEffect(() => {
    form.reset({
      titleEn: position.titleEn,
      titleAr: position.titleAr,
      gradeId: position.gradeId ?? undefined,
    })
  }, [position, form])

  const onSubmit = async (values: CreatePositionFormValues) => {
    try {
      await updatePosition.mutateAsync({
        id: position.id,
        data: values,
      })
      onOpenChange(false)
    } catch {
      // error toast handled in useUpdatePosition onError
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editPosition')}
      description={t('editPositionSub')}
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
            isLoading={updatePosition.isPending}
            label={t('update')}
            loadingLabel={t('updating')}
          />
        </form>
      </Form>
    </FormDialog>
  )
}

export default EditPositionDialog
