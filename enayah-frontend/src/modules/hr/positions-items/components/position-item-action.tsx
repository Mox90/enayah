'use client'

import { MoreVerticalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { PositionItem } from '../types/position.item.types'

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label={it('positionItemActions')}
          >
            <MoreVerticalIcon className='h-4 w-4 text-green-700' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuItem
            className='text-destructive'
            onClick={() => setDeleteOpen(true)}
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <EditPositionItemDialog
        pcn={positionItem}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeletePositionItemDialog
        pcn={positionItem}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      /> */}
    </>
  )
}
