// enayah-frontend/src/modules/hr/positions-items/components/delete-position-item-dialog.tsx

'use client'

import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

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
    if (isAssigned || deletePositionItem.isPending) {
      return
    }

    try {
      await deletePositionItem.mutateAsync(positionItem.id)

      // Close only after successful deletion.
      onOpenChange(false)
    } catch {
      /*
       * Toast handled by mutation hook.
       *
       * Keep the dialog open so the user can see that
       * the deletion did not succeed.
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
          <AlertDialogCancel disabled={deletePositionItem.isPending}>
            {t('cancel')}
          </AlertDialogCancel>

          {!isAssigned && (
            <Button
              type='button'
              variant='destructive'
              onClick={() => void handleDelete()}
              disabled={deletePositionItem.isPending}
            >
              {t('delete')}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
