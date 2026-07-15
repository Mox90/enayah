// src/components/footer/footer.tsx

import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'

interface FooterProps {
  onCancel: () => void
  onSave: () => void
  label: string
  savingLabel?: string
  disabled?: boolean
  isSaving?: boolean
  saveVariant?: ButtonVariant
  saveClassName?: string
  saveIcon?: ReactNode
}

export function Footer({
  onCancel,
  onSave,
  label,
  savingLabel,
  disabled = false,
  isSaving = false,
  saveVariant = 'default',
  saveClassName,
  saveIcon,
}: FooterProps) {
  const ct = useTranslations('common')

  return (
    <DialogFooter className='shrink-0 border-t bg-muted/40 px-6 py-5'>
      <Button
        type='button'
        variant='outline'
        disabled={isSaving}
        onClick={onCancel}
      >
        {ct('cancel')}
      </Button>

      <Button
        type='button'
        variant={saveVariant}
        disabled={disabled || isSaving}
        className={cn(
          saveVariant === 'default' &&
            'bg-slate-950 text-white hover:bg-slate-800',
          saveClassName,
        )}
        onClick={onSave}
      >
        {isSaving ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            {savingLabel ?? label}
          </>
        ) : (
          <>
            {saveIcon}
            {label}
          </>
        )}
      </Button>
    </DialogFooter>
  )
}
