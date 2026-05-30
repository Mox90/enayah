'use client'

import { MoreVerticalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Position } from '../types/position.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EditPositionDialog from './edit-position-dialog'
import DeletePositionDialog from './delete-position-dialog'
import { useTranslations } from 'next-intl'

interface PositionActionProps {
  position: Position
}

export function PositionActions({ position }: PositionActionProps) {
  const [editOpen, setEditOpen] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const t = useTranslations('common')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' aria-label='Position Action'>
            <MoreVerticalIcon className='h-4 w-4' />
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

      <EditPositionDialog
        position={position}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeletePositionDialog
        position={position}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
