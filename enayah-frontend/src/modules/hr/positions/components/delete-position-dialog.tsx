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
    await deletePosition.mutateAsync(position.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dt('deletePosition')}</AlertDialogTitle>

          <AlertDialogDescription>
            {t('confirmDelete')}{' '}
            <strong>
              {locale === 'ar' ? position.titleAr : position.titleEn}
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

export default DeletePositionDialog
