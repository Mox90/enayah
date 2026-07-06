import { useState } from 'react'
import { DialogFooter } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormDialog } from '../forms'
import { useLocale, useTranslations } from 'next-intl'

export type BoardFormValue = {
  id?: string
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean | null
  isVerified?: boolean | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: BoardFormValue | null
  onSubmit: (value: BoardFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: BoardFormValue = {
  boardName: '',
  specialty: null,
  issuingBody: '',
  issueDate: null,
  expiryDate: null,
  isLifetime: false,
  isVerified: false,
}

function BoardDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: BoardFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: BoardFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<BoardFormValue>(initialValue ?? emptyValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function update<K extends keyof BoardFormValue>(
    field: K,
    value: BoardFormValue[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function createClientId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `board-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (isSubmitting) return
    if (!form.boardName.trim()) return
    if (!form.issuingBody.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...form,
        id: form.id ?? (generateId ? createClientId() : undefined),
        specialty: form.specialty || null,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
      })

      onOpenChange(false)
    } catch (error) {
      // keep dialog open; upstream mutation hook can surface toast/error UI
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='space-y-6 px-6 py-1'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('boardSub2')}
            </h3>

            <p className='text-xs text-muted-foreground'>{crt('boardSub3')}</p>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2 xl:col-span-2'>
              <Label>{crt('boardName')}</Label>

              <Input
                className='h-11'
                value={form.boardName}
                onChange={(e) => update('boardName', e.target.value)}
                placeholder='Saudi Board in General Surgery'
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>{crt('specialty')}</Label>

              <Input
                className='h-11'
                value={form.specialty ?? ''}
                onChange={(e) => update('specialty', e.target.value || null)}
                placeholder='General Surgery'
              />
            </div>

            <div className='space-y-2 xl:col-span-2'>
              <Label>{crt('issuingBody')}</Label>

              <Input
                className='h-11'
                value={form.issuingBody}
                onChange={(e) => update('issuingBody', e.target.value)}
                placeholder='Saudi Commission for Health Specialties'
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('validityPeriodLbl')}
            </h3>

            <p className='text-xs text-muted-foreground'>
              {crt('validityPeriodSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{crt('issued')}</Label>

              <Input
                type='date'
                className='h-11 bg-background'
                value={form.issueDate ?? ''}
                onChange={(e) => update('issueDate', e.target.value || null)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{crt('expires')}</Label>

              <Input
                type='date'
                className='h-11 bg-background'
                value={form.expiryDate ?? ''}
                onChange={(e) => update('expiryDate', e.target.value || null)}
              />
            </div>
          </div>
        </section>
      </div>

      <DialogFooter className='border-t bg-muted/40 px-6 py-6'>
        <Button
          type='button'
          className='p-4'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          {crt('cancel')}
        </Button>

        <Button
          type='button'
          className='bg-slate-950 p-4 text-white hover:bg-slate-800'
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {crt('saveBoard', { item: isRtl ? 'مجلس' : 'Board' })}
        </Button>
      </DialogFooter>
    </>
  )
}

export function BoardDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-board' : 'closed')
  const crt = useTranslations('credentials')
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? crt('editBoard') : crt('addBoard')}
      description={crt('boardSub')}
      //className='w-[95vw] max-w-4xl overflow-hidden p-0'
      //headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
      className='w-[70vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0'
    >
      {open && (
        <BoardDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </FormDialog>
  )
}
