'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { FormDialog } from '@/components/forms'
import { Footer } from '@/components/footer/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [form, setForm] = useState<BoardFormValue>(
    initialValue ?? { ...emptyValue },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const crt = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale.toLowerCase().startsWith('ar')

  const boardName = form.boardName.trim()
  const issuingBody = form.issuingBody.trim()
  const issueDate = form.issueDate?.trim()
  const expiryDate = form.expiryDate?.trim()

  function update<K extends keyof BoardFormValue>(
    field: K,
    value: BoardFormValue[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function createClientId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    return `board-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const formInvalid =
    !boardName ||
    !issuingBody ||
    Boolean(issueDate && expiryDate && expiryDate < issueDate)

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) return

    //if (!boardName || !issuingBody) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        id: form.id ?? (generateId ? createClientId() : undefined),
        boardName,
        issuingBody,
        specialty: form.specialty?.trim() || null,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  // const submitDisabled =
  //   isSubmitting ||
  //   !form.boardName.trim() ||
  //   !form.issuingBody.trim() ||
  //   Boolean(
  //     form.issueDate && form.expiryDate && form.expiryDate < form.issueDate,
  //   )

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              {crt('boardSub2')}
            </h3>

            <p className='text-xs text-muted-foreground'>{crt('boardSub3')}</p>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='boardName'>
                {crt('boardName')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='boardName'
                className='h-11'
                value={form.boardName}
                disabled={isSubmitting}
                onChange={(event) => update('boardName', event.target.value)}
                placeholder='Saudi Board in General Surgery'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardSpecialty'>{crt('specialty')}</Label>

              <Input
                id='boardSpecialty'
                className='h-11'
                value={form.specialty ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('specialty', event.target.value || null)
                }
                placeholder='General Surgery'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardIssuingBody'>
                {crt('issuingBody')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='boardIssuingBody'
                className='h-11'
                value={form.issuingBody}
                disabled={isSubmitting}
                onChange={(event) => update('issuingBody', event.target.value)}
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
              <Label htmlFor='boardIssueDate'>{crt('issued')}</Label>

              <Input
                id='boardIssueDate'
                type='date'
                className='h-11 bg-background'
                value={issueDate ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('issueDate', event.target.value || null)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='boardExpiryDate'>{crt('expires')}</Label>

              <Input
                id='boardExpiryDate'
                type='date'
                className='h-11 bg-background'
                min={issueDate ?? undefined}
                value={expiryDate ?? ''}
                disabled={isSubmitting}
                onChange={(event) =>
                  update('expiryDate', event.target.value || null)
                }
              />
            </div>
          </div>
        </section>
      </div>

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={crt('save', {
          item: isRtl ? 'المجلس' : 'Board',
        })}
        savingLabel={crt('saving', { item: 'board' })}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<Save className='h-4 w-4' />}
      />
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
  const crt = useTranslations('credentials')

  const dialogKey = initialValue?.id ?? (open ? 'add-board' : 'closed')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialValue ? crt('editBoard') : crt('addBoard')}
      description={crt('boardSub')}
      className='md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white sm:px-6 sm:py-5'
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
