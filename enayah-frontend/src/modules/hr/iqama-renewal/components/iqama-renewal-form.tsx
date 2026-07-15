// src/modules/hr/iqama-renewal/components/iqama-renewal-form.tsx

'use client'

import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Fingerprint,
  IdCard,
  LoaderCircle,
  Save,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react'
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

import type {
  AssigneeOption,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'

import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'
import { IqamaRenewalWorkflowActions } from './iqama-renewal-workflow-actions'

interface Props {
  caseId?: string | null
  onCancel: () => void
  onSaved: () => void
  canManageWorkflow?: boolean
  governmentRelationsUsers?: AssigneeOption[]
}

type FormValues = {
  employeeId: string
  identificationId: string
  notes: string
}

type DetailItemProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
  valueDir?: 'ltr' | 'rtl'
  emphasis?: boolean
}

type MilestoneItemProps = {
  icon: LucideIcon
  label: string
  value: string
  completed?: boolean
  destructive?: boolean
  isLast?: boolean
}

const EMPTY_VALUES: FormValues = {
  employeeId: '',
  identificationId: '',
  notes: '',
}

function toDateInputValue(value?: string | null) {
  if (!value) return ''

  return value.slice(0, 10)
}

function formatDisplayDate(value: string | null | undefined, locale: string) {
  const dateValue = toDateInputValue(value)

  if (!dateValue) return '-'

  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function toNullable(value: string) {
  const normalized = value.trim()

  return normalized === '' ? null : normalized
}

function DetailItem({
  icon: Icon,
  label,
  value,
  valueDir,
  emphasis = false,
}: DetailItemProps) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md'>
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />

      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.07] text-primary shadow-sm'>
          <Icon className='h-5 w-5' aria-hidden='true' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <div
            className={
              emphasis
                ? 'mt-1 truncate text-base font-semibold tracking-tight text-foreground'
                : 'mt-1 truncate text-sm font-semibold text-foreground'
            }
            dir={valueDir}
          >
            {value || '-'}
          </div>
        </div>
      </div>
    </div>
  )
}

function MilestoneItem({
  icon: Icon,
  label,
  value,
  completed = false,
  destructive = false,
  isLast = false,
}: MilestoneItemProps) {
  const iconClass = destructive
    ? 'border-destructive/20 bg-destructive/10 text-destructive'
    : completed
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : 'border-border bg-background text-muted-foreground'

  return (
    <div className='relative flex gap-3'>
      {!isLast && (
        <div className='absolute bottom-[-18px] start-[19px] top-10 w-px bg-border/80' />
      )}

      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${iconClass}`}
      >
        <Icon className='h-4 w-4' aria-hidden='true' />
      </div>

      <div className='min-w-0 flex-1 pt-0.5'>
        <p className='text-sm font-medium text-foreground'>{label}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>{value}</p>
      </div>
    </div>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className='overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]'>
      <div className='border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-background p-6 sm:p-8'>
        <div className='flex items-center gap-4'>
          <div className='h-12 w-12 animate-pulse rounded-2xl bg-primary/10' />
          <div className='space-y-2'>
            <div className='h-5 w-52 animate-pulse rounded-full bg-muted' />
            <div className='h-3 w-32 animate-pulse rounded-full bg-muted' />
          </div>
        </div>
      </div>

      <div className='grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className='h-20 animate-pulse rounded-2xl border border-border/50 bg-muted/40'
          />
        ))}
      </div>

      <div className='flex items-center justify-center gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 text-sm text-muted-foreground'>
        <LoaderCircle className='h-4 w-4 animate-spin' />
        {label}
      </div>
    </div>
  )
}

export function IqamaRenewalForm({
  caseId,
  onCancel,
  onSaved,
  canManageWorkflow = false,
  governmentRelationsUsers = [],
}: Props) {
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

  const isEditing = Boolean(caseId)
  const isSaving = createProcess.isPending || updateProcess.isPending

  const initialValues = useMemo<FormValues>(() => {
    if (!existingCase) {
      return EMPTY_VALUES
    }

    return {
      employeeId: existingCase.employeeId,
      identificationId: existingCase.identificationId,
      notes: existingCase.notes ?? '',
    }
  }, [existingCase])

  const [changes, setChanges] = useState<Partial<FormValues>>({})

  const values: FormValues = {
    ...initialValues,
    ...changes,
  }

  //const hasChanges = Object.keys(changes).length > 0
  const hasChanges = (Object.keys(changes) as Array<keyof FormValues>).some(
    (key) => changes[key] !== initialValues[key],
  )

  const employeeName = isArabic
    ? existingCase?.employeeNameAr
    : existingCase?.employeeNameEn

  const mhrsdDecisionDate =
    existingCase?.mhrsdApprovedAt ?? existingCase?.mhrsdDeniedAt

  const mhrsdDecisionLabel = existingCase?.mhrsdApprovedAt
    ? t('mhrsdApprovedAt')
    : existingCase?.mhrsdDeniedAt
      ? t('mhrsdDeniedAt')
      : t('mhrsdDecision')

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
        if (!existingCase || !hasChanges) {
          return
        }

        const payload: UpdateIqamaRenewalCasePayload = {
          version: existingCase.version,
        }

        if (changes.notes !== undefined) {
          payload.notes = toNullable(changes.notes)
        }

        await updateProcess.mutateAsync({
          id: caseId,
          payload,
        })

        setChanges({})
      } else {
        if (!values.employeeId.trim() || !values.identificationId.trim()) {
          return
        }

        await createProcess.mutateAsync({
          employeeId: values.employeeId.trim(),
          identificationId: values.identificationId.trim(),
          notes: toNullable(values.notes),
        })
      }

      onSaved()
    } catch (error) {
      console.error('Failed to save Iqama renewal process:', error)
    }
  }

  if (isEditing && isLoadingCase) {
    return <LoadingState label={t('loadingProcess')} />
  }

  if (isEditing && isCaseError) {
    return (
      <div className='relative overflow-hidden rounded-3xl border border-destructive/20 bg-card p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8'>
        <div className='absolute -end-16 -top-16 h-48 w-48 rounded-full bg-destructive/10 blur-3xl' />

        <div className='relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive'>
              <AlertCircle className='h-5 w-5' />
            </div>

            <div>
              <p className='font-semibold text-foreground'>
                {t('loadProcessFailed')}
              </p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('editProcess')}
              </p>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            className='rounded-xl bg-background/80 shadow-sm backdrop-blur'
            onClick={onCancel}
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <form
        onSubmit={handleSubmit}
        className='relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_24px_80px_-42px_rgba(15,23,42,0.45)]'
      >
        <div className='pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl' />
        <div className='pointer-events-none absolute -start-28 top-32 h-64 w-64 rounded-full bg-sky-500/[0.05] blur-3xl' />

        <header className='relative border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background/95 to-background px-5 py-6 sm:px-7 sm:py-7'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm ring-4 ring-primary/[0.04]'>
                <ShieldCheck className='h-6 w-6' aria-hidden='true' />
              </div>

              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
                    {isEditing ? t('editProcess') : t('createProcess')}
                  </h1>

                  {existingCase && (
                    <IqamaRenewalStatusBadge status={existingCase.status} />
                  )}
                </div>

                {existingCase && (
                  <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                    <span className='inline-flex items-center gap-1.5'>
                      <UserRound className='h-3.5 w-3.5' />
                      {existingCase.employeeNumber ?? '-'}
                    </span>
                    <span className='inline-flex items-center gap-1.5'>
                      <Fingerprint className='h-3.5 w-3.5' />
                      {existingCase.iqamaNumber ?? '-'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-border/70 bg-background/80 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md'
              onClick={onCancel}
              disabled={isSaving}
            >
              <ArrowLeft
                className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`}
              />
              {t('back')}
            </Button>
          </div>
        </header>

        <div className='relative p-5 sm:p-7'>
          {existingCase ? (
            <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
              <div className='space-y-6'>
                <section className='rounded-2xl border border-border/60 bg-muted/[0.18] p-4 sm:p-5'>
                  <div className='grid gap-3 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2'>
                    <DetailItem
                      icon={IdCard}
                      label={t('employeeNumber')}
                      value={existingCase.employeeNumber ?? '-'}
                      emphasis
                    />

                    <DetailItem
                      icon={UserRound}
                      label={t('employeeName')}
                      value={employeeName ?? '-'}
                      valueDir={isArabic ? 'rtl' : 'ltr'}
                      emphasis
                    />

                    <DetailItem
                      icon={Fingerprint}
                      label={t('iqamaNumber')}
                      value={existingCase.iqamaNumber ?? '-'}
                      valueDir='ltr'
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label={t('expiryDate')}
                      value={formatDisplayDate(existingCase.expiryDate, locale)}
                    />

                    <DetailItem
                      icon={UserRoundCheck}
                      label={t('assignedTo')}
                      value={existingCase.assignedToName ?? '-'}
                    />

                    <DetailItem
                      icon={Clock3}
                      label={t('governmentRelationsDueDate')}
                      value={formatDisplayDate(
                        existingCase.governmentRelationsDueDate,
                        locale,
                      )}
                    />
                  </div>
                </section>

                {existingCase.denialReason && (
                  <section className='relative overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/[0.045] p-5'>
                    <div className='absolute inset-y-0 start-0 w-1 bg-destructive' />

                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
                        <AlertCircle className='h-4 w-4' />
                      </div>

                      <div>
                        <p className='text-sm font-semibold text-destructive'>
                          {t('denialReason')}
                        </p>
                        <p className='mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground/85'>
                          {existingCase.denialReason}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                <section className='rounded-2xl border border-border/60 bg-background p-5 shadow-sm'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary'>
                      <FileText className='h-4 w-4' />
                    </div>
                    <Label
                      htmlFor='notes'
                      className='text-sm font-semibold text-foreground'
                    >
                      {t('notes')}
                    </Label>
                  </div>

                  <Textarea
                    id='notes'
                    rows={7}
                    value={values.notes}
                    disabled={isSaving}
                    className='min-h-36 resize-y rounded-xl border-border/70 bg-muted/[0.22] leading-6 shadow-inner transition-colors focus-visible:bg-background'
                    onChange={(event) =>
                      updateField('notes', event.target.value)
                    }
                  />
                </section>
              </div>

              <aside className='h-fit rounded-2xl border border-border/60 bg-muted/[0.18] p-5 shadow-sm xl:sticky xl:top-6'>
                <div className='mb-5 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.07] text-primary'>
                    <ClipboardList className='h-5 w-5' />
                  </div>

                  <div>
                    <p className='text-sm font-semibold text-foreground'>
                      {t('currentStage')}
                    </p>
                    <div className='mt-1'>
                      <IqamaRenewalStatusBadge status={existingCase.status} />
                    </div>
                  </div>
                </div>

                <div className='space-y-5 rounded-2xl border border-border/50 bg-background/80 p-4'>
                  <MilestoneItem
                    icon={existingCase.mhrsdUploadedAt ? CheckCircle2 : Clock3}
                    label={t('mhrsdUploadDate')}
                    value={formatDisplayDate(
                      existingCase.mhrsdUploadedAt,
                      locale,
                    )}
                    completed={Boolean(existingCase.mhrsdUploadedAt)}
                  />

                  <MilestoneItem
                    icon={
                      existingCase.mhrsdDeniedAt
                        ? AlertCircle
                        : existingCase.mhrsdApprovedAt
                          ? CheckCircle2
                          : Clock3
                    }
                    label={mhrsdDecisionLabel}
                    value={formatDisplayDate(mhrsdDecisionDate, locale)}
                    completed={Boolean(existingCase.mhrsdApprovedAt)}
                    destructive={Boolean(existingCase.mhrsdDeniedAt)}
                  />

                  <MilestoneItem
                    icon={CalendarDays}
                    label={t('governmentRelationsDueDate')}
                    value={formatDisplayDate(
                      existingCase.governmentRelationsDueDate,
                      locale,
                    )}
                    completed={Boolean(existingCase.governmentRelationsDueDate)}
                    isLast
                  />
                </div>
              </aside>
            </div>
          ) : (
            <div className='space-y-6'>
              <section className='grid gap-4 md:grid-cols-2'>
                <div className='group rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all focus-within:border-primary/35 focus-within:ring-4 focus-within:ring-primary/[0.06]'>
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary'>
                      <UserRound className='h-4 w-4' />
                    </div>
                    <Label
                      htmlFor='employeeId'
                      className='text-sm font-semibold'
                    >
                      {t('employeeId')}
                    </Label>
                  </div>

                  <Input
                    id='employeeId'
                    value={values.employeeId}
                    disabled={isSaving}
                    required
                    className='h-11 rounded-xl border-border/60 bg-muted/[0.25] shadow-inner focus-visible:bg-background focus-visible:ring-0'
                    onChange={(event) =>
                      updateField('employeeId', event.target.value)
                    }
                  />
                </div>

                <div className='group rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all focus-within:border-primary/35 focus-within:ring-4 focus-within:ring-primary/[0.06]'>
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary'>
                      <Fingerprint className='h-4 w-4' />
                    </div>
                    <Label
                      htmlFor='identificationId'
                      className='text-sm font-semibold'
                    >
                      {t('identificationId')}
                    </Label>
                  </div>

                  <Input
                    id='identificationId'
                    value={values.identificationId}
                    disabled={isSaving}
                    required
                    className='h-11 rounded-xl border-border/60 bg-muted/[0.25] shadow-inner focus-visible:bg-background focus-visible:ring-0'
                    onChange={(event) =>
                      updateField('identificationId', event.target.value)
                    }
                  />
                </div>
              </section>

              <section className='rounded-2xl border border-border/60 bg-background p-5 shadow-sm'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary'>
                    <FileText className='h-4 w-4' />
                  </div>
                  <Label
                    htmlFor='notes'
                    className='text-sm font-semibold text-foreground'
                  >
                    {t('notes')}
                  </Label>
                </div>

                <Textarea
                  id='notes'
                  rows={7}
                  value={values.notes}
                  disabled={isSaving}
                  className='min-h-36 resize-y rounded-xl border-border/70 bg-muted/[0.22] leading-6 shadow-inner transition-colors focus-visible:bg-background'
                  onChange={(event) => updateField('notes', event.target.value)}
                />
              </section>
            </div>
          )}
        </div>

        <footer className='relative flex flex-col-reverse gap-3 border-t border-border/60 bg-muted/[0.18] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7'>
          <Button
            type='button'
            variant='outline'
            className='h-11 rounded-xl bg-background shadow-sm'
            onClick={onCancel}
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>

          <Button
            type='submit'
            className='h-11 min-w-32 rounded-xl shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20'
            disabled={isSaving || (isEditing && !hasChanges)}
          >
            {isSaving ? (
              <LoaderCircle className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            {isSaving ? t('saving') : t('save')}
          </Button>
        </footer>
      </form>

      {existingCase && (
        <div className='rounded-3xl border border-border/60 bg-card p-1 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)]'>
          <IqamaRenewalWorkflowActions
            renewalCase={existingCase}
            canManageWorkflow={canManageWorkflow}
            governmentRelationsUsers={governmentRelationsUsers}
          />
        </div>
      )}
    </div>
  )
}
