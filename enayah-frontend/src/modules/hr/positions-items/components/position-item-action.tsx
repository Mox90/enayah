// enayah-frontend/src/modules/hr/positions-items/components/position-item-action.tsx

'use client'

import { useState } from 'react'

import { MoreVerticalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { PositionItem } from '../types/position.item.types'

import { DeletePositionItemDialog } from './delete-position-item-dialog'
import { EditPositionItemDialog } from './edit-position-item-dialog'

interface PositionItemActionsProps {
  positionItem: PositionItem
}

export function PositionItemActions({
  positionItem,
}: PositionItemActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const t = useTranslations('common')
  const it = useTranslations('positionItems')

  const cannotDelete =
    positionItem.status === 'filled' || positionItem.status === 'reserved'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label={it('positionItemActions')}
          >
            <MoreVerticalIcon className='size-4 text-green-700' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={cannotDelete}
            className='text-destructive'
            onClick={() => {
              if (!cannotDelete) {
                setDeleteOpen(true)
              }
            }}
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPositionItemDialog
        positionItem={positionItem}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeletePositionItemDialog
        positionItem={positionItem}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
