import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'

export function Footer({
  onCancel,
  onSave,
  label,
}: {
  onCancel: () => void
  onSave: () => void
  label: string
}) {
  const ct = useTranslations('common')
  return (
    <DialogFooter className='border-t bg-muted/40 px-6 py-8 shrink-0'>
      <Button type='button' variant='outline' onClick={onCancel}>
        {ct('cancel')}
      </Button>

      <Button
        type='button'
        className='bg-slate-950 text-white hover:bg-slate-800'
        onClick={onSave}
      >
        {label}
      </Button>
    </DialogFooter>
  )
}
