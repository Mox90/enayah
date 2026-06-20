'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DegreeFormValue = {
  id?: string
  degreeType:
    | 'diploma'
    | 'associate'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'
  degreeName: string
  major?: string | null
  institution: string
  graduationDate?: string | null
  isVerified?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: DegreeFormValue | null
  onSubmit: (value: DegreeFormValue) => void | Promise<void>
  generateId?: boolean
}

const emptyValue: DegreeFormValue = {
  degreeType: 'bachelor',
  degreeName: '',
  major: null,
  institution: '',
  graduationDate: null,
  isVerified: false,
}

function DegreeDialogContent({
  initialValue,
  onOpenChange,
  onSubmit,
  generateId,
}: {
  initialValue?: DegreeFormValue | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: DegreeFormValue) => void | Promise<void>
  generateId: boolean
}) {
  const [form, setForm] = useState<DegreeFormValue>(initialValue ?? emptyValue)

  function update<K extends keyof DegreeFormValue>(
    field: K,
    value: DegreeFormValue[K],
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

    return `degree-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function handleSubmit() {
    if (!form.degreeName.trim()) return
    if (!form.institution.trim()) return

    await onSubmit({
      ...form,
      id: form.id ?? (generateId ? createClientId() : undefined),
      major: form.major || null,
      graduationDate: form.graduationDate || null,
    })
    //console.log('DATA INPUT IS ', form)
    onOpenChange(false)
  }

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>{initialValue ? 'Edit Degree' : 'Add Degree'}</DialogTitle>
        <DialogDescription>
          Enter the employee&apos;s educational qualification details.
        </DialogDescription>
      </DialogHeader>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>Degree Name *</Label>
          <Input
            value={form.degreeName}
            onChange={(e) => update('degreeName', e.target.value)}
            placeholder='Bachelor of Science in Nursing'
          />
        </div>

        <div className='space-y-2'>
          <Label>Degree Type *</Label>
          <Select
            value={form.degreeType}
            onValueChange={(v) =>
              update('degreeType', v as DegreeFormValue['degreeType'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='diploma'>Diploma</SelectItem>
              <SelectItem value='associate'>Associate</SelectItem>
              <SelectItem value='bachelor'>Bachelor</SelectItem>
              <SelectItem value='master'>Master</SelectItem>
              <SelectItem value='doctorate'>Doctorate</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Major</Label>
          <Input
            value={form.major ?? ''}
            onChange={(e) => update('major', e.target.value || null)}
            placeholder='Nursing'
          />
        </div>

        <div className='space-y-2'>
          <Label>Institution *</Label>
          <Input
            value={form.institution}
            onChange={(e) => update('institution', e.target.value)}
            placeholder='University Name'
          />
        </div>

        <div className='space-y-2'>
          <Label>Graduation Date</Label>
          <Input
            type='date'
            value={form.graduationDate ?? ''}
            onChange={(e) => update('graduationDate', e.target.value || null)}
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
          Save Degree
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function DegreeDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  generateId = false,
}: Props) {
  const dialogKey = initialValue?.id ?? (open ? 'add-degree' : 'closed')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DegreeDialogContent
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
