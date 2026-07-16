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
    <DialogFooter className='min-h-[84px] shrink-0 gap-3 border-t border-border/60 bg-muted/[0.18] px-5 py-4 pb-7 sm:items-center sm:justify-end sm:px-7'>
      {/* <DialogFooter className='shrink-0 items-center gap-3 border-t bg-muted/40 px-6 pb-7 pt-5 sm:justify-end'> */}
      <Button
        type='button'
        variant='outline'
        className='h-11 rounded-xl bg-background px-5 shadow-sm'
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
          'h-11 min-w-32 rounded-xl px-5 shadow-md transition-all',
          'hover:-translate-y-0.5 hover:shadow-lg',

          saveVariant === 'default' &&
            'bg-slate-950 text-white shadow-slate-950/15 hover:bg-slate-800 hover:shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200',

          saveVariant === 'destructive' &&
            'shadow-destructive/15 hover:shadow-destructive/20',

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
