'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Position } from '../types/position.types'
import { useDeletePosition } from '../hooks/use-delete-position'
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

interface Props {
  position: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeletePositionDialog = ({ position, open, onOpenChange }: Props) => {
  const t = useTranslations('common')
  const dt = useTranslations('positions')
  const locale = useLocale()

  const deletePosition = useDeletePosition()

  const handleDelete = async () => {
    try {
      await deletePosition.mutateAsync(position.id)
      onOpenChange(false)
    } catch {
      // Error already handled by useDeletePosition.onError
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dt('deletePosition')}</AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich('confirmDelete', {
              name: locale === 'ar' ? position.titleAr : position.titleEn,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePosition.isPending}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePositionDialog
