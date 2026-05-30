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
    try {
      await deleteDepartment.mutateAsync(department.id)
      onOpenChange(false)
    } catch {
      // Error already handled by useDeleteDepartment.onError
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dt('deleteDepartment')}</AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich('confirmDelete', {
              name: locale === 'ar' ? department.nameAr : department.nameEn,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteDepartment.isPending}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
