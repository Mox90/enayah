// enayah-frontend/src/components/dialogs/row-actions.tsx

'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '../ui/button'

export function RowActions({
  onEdit,
  onDelete,
  onVerify,
}: {
  onEdit?: () => void
  onDelete?: () => void
  onVerify?: () => void
}) {
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  if (!onEdit && !onDelete && !onVerify) return null
  return (
    <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button size='icon' variant='ghost' aria-label='Row actions'>
          <MoreVertical className='h-4 w-4 text-green-700' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className='mr-2 h-4 w-4' />
            {ct('edit')}
          </DropdownMenuItem>
        )}

        {onVerify && (
          <DropdownMenuItem onClick={onVerify}>
            <Check className='mr-2 h-4 w-4' />
            {ct('verify')}
          </DropdownMenuItem>
        )}

        {onDelete && (onEdit || onVerify) && <DropdownMenuSeparator />}

        {onDelete && (
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={onDelete}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {ct('delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
