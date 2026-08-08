// enayah-frontend/src/components/dialogs/row-actions.tsx

'use client'

import { useState } from 'react'
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'

interface RowActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onVerify?: () => void

  /**
   * When true, deletion requires confirmation.
   */
  confirmDelete?: boolean

  /**
   * Optional record name shown in the confirmation message.
   * Example: "Degree", "Board certification".
   */
  deleteItemName?: string
}

export function RowActions({
  onEdit,
  onDelete,
  onVerify,
  confirmDelete = false,
  deleteItemName,
}: RowActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  if (!onEdit && !onDelete && !onVerify) {
    return null
  }

  function handleDeleteRequest(): void {
    if (!onDelete) {
      return
    }

    if (confirmDelete) {
      setDeleteDialogOpen(true)
      return
    }

    onDelete()
  }

  function handleConfirmDelete(): void {
    if (!onDelete) {
      return
    }

    onDelete()
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            aria-label={ct('actions')}
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className='me-2 h-4 w-4' />
              {ct('edit')}
            </DropdownMenuItem>
          )}

          {onVerify && (
            <DropdownMenuItem onClick={onVerify}>
              <Check className='me-2 h-4 w-4' />
              {ct('verify')}
            </DropdownMenuItem>
          )}

          {onDelete && (onEdit || onVerify) && <DropdownMenuSeparator />}

          {onDelete && (
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onSelect={handleDeleteRequest}
            >
              <Trash2 className='me-2 h-4 w-4' />
              {ct('delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && confirmDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ct('deleteConfirmation.title')}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {ct('deleteConfirmation.description', {
                  item: deleteItemName ?? ct('record'),
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>{ct('cancel')}</AlertDialogCancel>

              <AlertDialogAction
                onClick={handleConfirmDelete}
                //className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                className={buttonVariants({
                  variant: 'destructive',
                })}
              >
                {ct('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
