//src/modules/hr/iqama-renewal/components/iqama-renewal-form.tsx

'use client'

import { type FormEvent, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  useCreateIqamaRenewalProcess,
  useIqamaRenewalProcess,
  useUpdateIqamaRenewalCase,
} from '../hooks/use-iqama-renewal-processes'
import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'
import {
  IqamaRenewalStatus,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'

interface Props {
  caseId?: string | null
  onCancel: () => void
  onSaved: () => void
}

type FormValues = {
  employeeId: string
  identificationId: string
  status: IqamaRenewalStatus
  assignedToUserId: string
  governmentRelationsDueDate: string
  notes: string
}

const EMPTY_VALUES: FormValues = {
  employeeId: '',
  identificationId: '',
  status: 'pending_upload',
  assignedToUserId: '',
  governmentRelationsDueDate: '',
  notes: '',
}

function toDateInputValue(value?: string | null) {
  if (!value) return ''

  return value.slice(0, 10)
}

function toNullable(value: string) {
  const normalized = value.trim()

  return normalized === '' ? null : normalized
}

export function IqamaRenewalForm({ caseId, onCancel, onSaved }: Props) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()
  const isArabic = locale.toLowerCase().startsWith('ar')

  const {
    data: existingCase,
    isLoading: isLoadingCase,
    isError: isCaseError,
  } = useIqamaRenewalProcess(caseId)

  const createProcess = useCreateIqamaRenewalProcess()
  const updateProcess = useUpdateIqamaRenewalCase()

  //const [values, setValues] = useState<FormValues>(EMPTY_VALUES)

  const isEditing = Boolean(caseId)
  const isSaving = createProcess.isPending || updateProcess.isPending

  const initialValues = useMemo<FormValues>(() => {
    if (!existingCase) {
      return EMPTY_VALUES
    }

    return {
      employeeId: existingCase.employeeId,
      identificationId: existingCase.identificationId,
      status: existingCase.status,
      assignedToUserId: existingCase.assignedToUserId ?? '',
      governmentRelationsDueDate: toDateInputValue(
        existingCase.governmentRelationsDueDate,
      ),
      notes: existingCase.notes ?? '',
    }
  }, [existingCase])

  const [changes, setChanges] = useState<Partial<FormValues>>({})

  const values: FormValues = {
    ...initialValues,
    ...changes,
  }

  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setChanges((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      if (caseId) {
        if (!existingCase) return

        const updatePayload: UpdateIqamaRenewalCasePayload = {
          status: values.status,
          assignedToUserId: toNullable(values.assignedToUserId),
          governmentRelationsDueDate: toNullable(
            values.governmentRelationsDueDate,
          ),
          notes: toNullable(values.notes),
        }

        await updateProcess.mutateAsync({
          id: caseId,
          payload: updatePayload,
        })
      } else {
        if (!values.employeeId.trim() || !values.identificationId.trim()) {
          return
        }

        const createPayload = {
          employeeId: values.employeeId.trim(),
          identificationId: values.identificationId.trim(),
          assignedToUserId: toNullable(values.assignedToUserId),
          governmentRelationsDueDate: toNullable(
            values.governmentRelationsDueDate,
          ),
          notes: toNullable(values.notes),
        }

        await createProcess.mutateAsync(createPayload)
      }

      onSaved()
    } catch (error) {
      // Mutation hooks already display an error toast.
      console.error('Failed to save Iqama process:', error)
    }
  }

  if (isEditing && isLoadingCase) {
    return <div className='rounded-xl border p-6'>{t('loadingProcess')}</div>
  }

  if (isEditing && isCaseError) {
    return (
      <div className='space-y-4 rounded-xl border p-6'>
        <p className='text-sm text-destructive'>{t('loadProcessFailed')}</p>

        <Button type='button' variant='outline' onClick={onCancel}>
          {t('back')}
        </Button>
      </div>
    )
  }

  const employeeName = isArabic
    ? existingCase?.employeeNameAr
    : existingCase?.employeeNameEn

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6 rounded-2xl border bg-card p-6 shadow-sm'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>
            {isEditing ? t('editProcess') : t('createProcess')}
          </h1>

          {existingCase && (
            <div className='mt-2'>
              <IqamaRenewalStatusBadge status={existingCase.status} />
            </div>
          )}
        </div>

        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('cancel')}
        </Button>
      </div>

      {existingCase && (
        <div className='grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-3'>
          <div>
            <div className='text-xs text-muted-foreground'>
              {t('employeeNumber')}
            </div>
            <div className='font-medium'>
              {existingCase.employeeNumber ?? '-'}
            </div>
          </div>

          <div>
            <div className='text-xs text-muted-foreground'>
              {t('employeeName')}
            </div>
            <div className='font-medium' dir={isArabic ? 'rtl' : 'ltr'}>
              {employeeName ?? '-'}
            </div>
          </div>

          <div>
            <div className='text-xs text-muted-foreground'>
              {t('iqamaNumber')}
            </div>
            <div className='font-medium'>{existingCase.iqamaNumber ?? '-'}</div>
          </div>
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='employeeId'>{t('employeeId')}</Label>

          <Input
            id='employeeId'
            value={values.employeeId}
            disabled={isEditing || isSaving}
            required={!isEditing}
            onChange={(event) => updateField('employeeId', event.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='identificationId'>{t('identificationId')}</Label>

          <Input
            id='identificationId'
            value={values.identificationId}
            disabled={isEditing || isSaving}
            required={!isEditing}
            onChange={(event) =>
              updateField('identificationId', event.target.value)
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='assignedToUserId'>{t('assignedTo')}</Label>

          <Input
            id='assignedToUserId'
            value={values.assignedToUserId}
            disabled={isSaving}
            onChange={(event) =>
              updateField('assignedToUserId', event.target.value)
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='governmentRelationsDueDate'>
            {t('governmentRelationsDueDate')}
          </Label>

          <Input
            id='governmentRelationsDueDate'
            type='date'
            value={values.governmentRelationsDueDate}
            disabled={isSaving}
            onChange={(event) =>
              updateField('governmentRelationsDueDate', event.target.value)
            }
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>{t('notes')}</Label>

        <Textarea
          id='notes'
          rows={5}
          value={values.notes}
          disabled={isSaving}
          onChange={(event) => updateField('notes', event.target.value)}
        />
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('cancel')}
        </Button>

        <Button type='submit' disabled={isSaving}>
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  )
}
