// enayah-frontend/src/modules/hr/positions-items/components/delete-position-item-dialog.tsx

'use client'

import { useTranslations } from 'next-intl'

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

import { useDeletePositionItem } from '../hooks/use-delete-position-item'
import type { PositionItem } from '../types/position.item.types'

interface Props {
  positionItem: PositionItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePositionItemDialog({
  positionItem,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations('common')
  const pt = useTranslations('positionItems')

  const deletePositionItem = useDeletePositionItem()

  const isAssigned =
    positionItem.status === 'filled' || positionItem.status === 'reserved'

  async function handleDelete() {
    if (isAssigned) {
      return
    }

    try {
      await deletePositionItem.mutateAsync(positionItem.id)

      onOpenChange(false)
    } catch {
      /*
       * Toast handled by mutation hook.
       */
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{pt('deletePositionItem')}</AlertDialogTitle>

          <AlertDialogDescription>
            {isAssigned
              ? pt('cannotDeleteAssigned', {
                  itemNumber: positionItem.itemNumber,
                })
              : t.rich('confirmDelete', {
                  name: positionItem.itemNumber,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

          {!isAssigned && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePositionItem.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('delete')}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
