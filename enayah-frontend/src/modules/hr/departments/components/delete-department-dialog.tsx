'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Department } from '../types/department.types'
import { useDeleteDepartment } from '../hooks/use-delete-departments'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  department: Department
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDepartmentDialog({
  department,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations('common')
  const dt = useTranslations('departments')
  const locale = useLocale()

  const deleteDepartment = useDeleteDepartment()

  const handleDelete = async () => {
    await deleteDepartment.mutateAsync(department.id)

    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dt('deleteDepartment')}</AlertDialogTitle>

          <AlertDialogDescription>
            {t('confirmDelete')}{' '}
            <strong>
              {locale === 'ar' ? department.nameAr : department.nameEn}
            </strong>
            {t('questionMark')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete}>
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
