import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'

export type BoardFormValue = {
  id?: string
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean | null
  isVerified?: boolean | false
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
    if (!form.boardName.trim()) return
    if (!form.issuingBody.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      specialty: form.specialty || null,
      issueDate: form.issueDate || null,
      expiryDate: form.expiryDate || null,
    })

    onOpenChange(false)
  }

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>{initialValue ? 'Edit Board' : 'Add Board'}</DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s board qualification details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Board Name *</Label>
          <Input
            value={form.boardName}
            onChange={(e) => update('boardName', e.target.value)}
            placeholder='Saudi Board in General Surgery'
          />
        </div>

        <div className='space-y-2'>
          <Label>Specialty</Label>
          <Input
            value={form.specialty ?? ''}
            onChange={(e) => update('specialty', e.target.value || null)}
            placeholder='General Surgery'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issuing Body *</Label>
          <Input
            value={form.issuingBody}
            onChange={(e) => update('issuingBody', e.target.value)}
            placeholder='Saudi Commission for Health Specialties'
          />
        </div>

        <div className='space-y-2'>
          <Label>Issue Date</Label>
          <Input
            type='date'
            value={form.issueDate ?? ''}
            onChange={(e) => update('issueDate', e.target.value || null)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Expiry Date</Label>
          <Input
            type='date'
            value={form.expiryDate ?? ''}
            onChange={(e) => update('expiryDate', e.target.value || null)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>

        <Button type='button' onClick={handleSubmit}>
          Save Board
        </Button>
      </DialogFooter>
    </DialogContent>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <BoardDialogContent
          key={dialogKey}
          initialValue={initialValue}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          generateId={generateId}
        />
      )}
    </Dialog>
  )
}
