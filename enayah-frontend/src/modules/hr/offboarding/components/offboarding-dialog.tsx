// enayah-frontend/src/modules/hr/offboarding/components/offboarding-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { AxiosError } from 'axios'
import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Send,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'

import { DatePicker } from '@/components/dialogs/date-picker'
import { Footer } from '@/components/footer/footer'
import { FormDialog } from '@/components/forms'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'

import {
  employmentSeparationTypeValues,
  type CreateSeparationPayload,
  type EmploymentSeparation,
  type EmploymentSeparationStatus,
  type EmploymentSeparationType,
} from '../types/offboarding.types'

import {
  useApproveSeparation,
  useCancelSeparation,
  useCompleteSeparation,
  useCreateSeparation,
  useEmploymentSeparations,
  useSubmitSeparation,
  useUpdateSeparation,
} from '../hooks/use-offboarding'
import { getTodayInRiyadh } from '@/utils/utilities'

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void

  employmentId: string
  employeeName: string

  employmentStartDate: string
  contractEndDate: string
}

interface OffboardingDialogContentProps extends Props {
  existing?: EmploymentSeparation
}

type FormState = {
  separationType: EmploymentSeparationType
  noticeDate: string | null
  effectiveDate: string
  reason: string
  remarks: string
}

interface SectionProps {
  title: string
  description?: string
  badge?: string
  children: ReactNode
}

interface ReadOnlyFieldProps {
  label: string
  value?: ReactNode
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const openStatuses: EmploymentSeparationStatus[] = [
  'draft',
  'pending_approval',
  'approved',
]

type ConfirmAction = 'cancel' | 'complete' | null

/* -------------------------------------------------------------------------- */
/* UI Helpers                                                                  */
/* -------------------------------------------------------------------------- */

function Section({ title, description, badge, children }: SectionProps) {
  return (
    <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
      <div className='border-b bg-muted/20 px-5 py-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold tracking-tight'>{title}</h3>

            {description && (
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            )}
          </div>

          {badge && (
            <span className='shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className='p-5'>{children}</div>
    </section>
  )
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className='min-w-0 rounded-lg border bg-muted/20 px-3 py-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>

      <div className='mt-1 truncate text-sm font-semibold'>
        {hasValue ? value : '—'}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Form Initialization                                                         */
/* -------------------------------------------------------------------------- */

function createInitialForm(existing?: EmploymentSeparation): FormState {
  if (existing) {
    return {
      separationType: existing.separationType,
      noticeDate: existing.noticeDate,
      effectiveDate: existing.effectiveDate,
      reason: existing.reason ?? '',
      remarks: existing.remarks ?? '',
    }
  }

  return {
    separationType: 'resignation',
    noticeDate: null,
    effectiveDate: '',
    reason: '',
    remarks: '',
  }
}

/* -------------------------------------------------------------------------- */
/* Dialog Content                                                              */
/* -------------------------------------------------------------------------- */

function OffboardingDialogContent({
  open,
  onOpenChange,
  employmentId,
  employeeName,
  employmentStartDate,
  contractEndDate,
  existing,
}: OffboardingDialogContentProps) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('offboarding')
  const common = useTranslations('common')

  const createMutation = useCreateSeparation(employmentId)
  const updateMutation = useUpdateSeparation(employmentId)

  const [form, setForm] = useState<FormState>(() => createInitialForm(existing))
  const [error, setError] = useState<string | null>(null)

  const submitMutation = useSubmitSeparation(employmentId)
  const approveMutation = useApproveSeparation(employmentId)
  const cancelMutation = useCancelSeparation(employmentId)
  const completeMutation = useCompleteSeparation(employmentId)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending ||
    cancelMutation.isPending ||
    completeMutation.isPending

  /*
   * Once submitted / approved, the employee profile
   * provides a read-only view.
   *
   * The approval workflow can later live in the
   * dedicated Offboarding workspace.
   */
  //const readOnly =
  //  existing?.status === 'pending_approval' || existing?.status === 'approved'

  const isDraft = existing?.status === 'draft'
  const isPendingApproval = existing?.status === 'pending_approval'
  const isApproved = existing?.status === 'approved'

  const readOnly = isPendingApproval || isApproved

  const today = getTodayInRiyadh()

  const canCompleteNow = Boolean(
    isApproved && existing && existing.effectiveDate <= today,
  )
  /* ------------------------------------------------------------------------ */
  /* Labels                                                                    */
  /* ------------------------------------------------------------------------ */

  const separationLabels: Record<EmploymentSeparationType, string> = {
    eoc: t('types.eoc'),
    resignation: t('types.resignation'),
    termination: t('types.termination'),
    retirement: t('types.retirement'),
    transfer_out: t('types.transferOut'),
    death: t('types.death'),
    mutual_agreement: t('types.mutualAgreement'),
    other: t('types.other'),
  }

  const currentStatusLabel = existing
    ? t(`statuses.${existing.status}`)
    : undefined

  /* ------------------------------------------------------------------------ */
  /* Validation                                                                */
  /* ------------------------------------------------------------------------ */

  function validate() {
    if (!form.effectiveDate) {
      return t('validation.effectiveDateRequired')
    }

    if (form.effectiveDate < employmentStartDate) {
      return t('validation.beforeEmploymentStart')
    }

    if (form.effectiveDate > contractEndDate) {
      return t('validation.afterContractEnd')
    }

    if (form.noticeDate && form.noticeDate > form.effectiveDate) {
      return t('validation.noticeAfterEffectiveDate')
    }

    if (
      form.separationType === 'eoc' &&
      form.effectiveDate !== contractEndDate
    ) {
      return t('validation.eocMustMatchContractEnd')
    }

    return null
  }

  function buildPayload(): CreateSeparationPayload {
    return {
      separationType: form.separationType,
      noticeDate: form.noticeDate,
      effectiveDate: form.effectiveDate,
      reason: form.reason.trim() || null,
      remarks: form.remarks.trim() || null,
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Save                                                                      */
  /* ------------------------------------------------------------------------ */

  async function handleSave() {
    if (isSubmitting || readOnly) {
      return
    }

    setError(null)

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      if (isDraft && existing) {
        await updateMutation.mutateAsync({
          separationId: existing.id,
          payload: buildPayload(),
        })
      } else {
        await createMutation.mutateAsync(buildPayload())
      }

      toast.success(t('draftSaved'))

      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof AxiosError ? err.response?.data?.message : undefined

      setError(message ?? t('saveFailed'))
    }
  }

  async function handleSubmitForApproval() {
    if (!existing || existing.status !== 'draft' || isSubmitting) {
      return
    }

    setError(null)

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      /*
       * Persist any unsaved edits first.
       */
      await updateMutation.mutateAsync({
        separationId: existing.id,
        payload: buildPayload(),
      })

      await submitMutation.mutateAsync(existing.id)

      toast.success(t('submittedForApproval'))
    } catch (err) {
      const message =
        err instanceof AxiosError ? err.response?.data?.message : undefined

      setError(message ?? t('workflowActionFailed'))
    }
  }

  async function handleApprove() {
    if (!existing || existing.status !== 'pending_approval' || isSubmitting) {
      return
    }

    setError(null)

    try {
      await approveMutation.mutateAsync(existing.id)

      toast.success(t('approvedSuccessfully'))
    } catch (err) {
      const message =
        err instanceof AxiosError ? err.response?.data?.message : undefined

      setError(message ?? t('workflowActionFailed'))
    }
  }

  async function executeConfirmedAction() {
    if (!existing || !confirmAction) {
      return
    }

    setError(null)

    try {
      if (confirmAction === 'cancel') {
        await cancelMutation.mutateAsync(existing.id)

        toast.success(t('cancelledSuccessfully'))

        setConfirmAction(null)
        onOpenChange(false)

        return
      }

      if (confirmAction === 'complete') {
        await completeMutation.mutateAsync(existing.id)

        toast.success(t('completedSuccessfully'))

        setConfirmAction(null)
        onOpenChange(false)
      }
    } catch (err) {
      const message =
        err instanceof AxiosError ? err.response?.data?.message : undefined

      setConfirmAction(null)

      setError(message ?? t('workflowActionFailed'))
    }
  }

  function closeDialog() {
    if (isSubmitting) {
      return
    }

    onOpenChange(false)
  }

  return (
    <>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'
      >
        {/* ------------------------------------------------ */}
        {/* Employment Overview */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('employmentOverview')}
          description={t('employmentOverviewSub')}
          badge={currentStatusLabel}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <ReadOnlyField label={t('employee')} value={employeeName} />

            <ReadOnlyField
              label={t('employmentStartDate')}
              value={
                <span dir='ltr' className='tabular-nums'>
                  {employmentStartDate}
                </span>
              }
            />

            <ReadOnlyField
              label={t('contractEndDate')}
              value={
                <span dir='ltr' className='tabular-nums'>
                  {contractEndDate}
                </span>
              }
            />
          </div>
        </Section>

        {error && (
          <div className='rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive'>
            {error}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* Separation Type */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('separationDetails')}
          description={t('separationDetailsSub')}
          badge={existing?.status === 'draft' ? t('statuses.draft') : undefined}
        >
          <div className='space-y-2'>
            <Label htmlFor='offboarding-separation-type'>
              {t('separationType')}

              <span className='ms-1 text-destructive'>*</span>
            </Label>

            <Select
              disabled={readOnly || isSubmitting}
              value={form.separationType}
              onValueChange={(value) => {
                const separationType = value as EmploymentSeparationType

                setError(null)

                setForm((current) => ({
                  ...current,
                  separationType,

                  /*
                   * EOC always ends on the
                   * active contract end date.
                   */
                  effectiveDate:
                    separationType === 'eoc'
                      ? contractEndDate
                      : current.effectiveDate,
                }))
              }}
            >
              <SelectTrigger id='offboarding-separation-type' className='h-11'>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {employmentSeparationTypeValues.map((type) => (
                  <SelectItem key={type} value={type}>
                    {separationLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {form.separationType === 'eoc' && (
              <p className='text-xs leading-relaxed text-muted-foreground'>
                {t('eocDateHint')}
              </p>
            )}
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Separation Dates */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('separationDates')}
          description={t('separationDatesSub')}
        >
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='offboarding-notice-date'>{t('noticeDate')}</Label>

              <DatePicker
                id='offboarding-notice-date'
                value={form.noticeDate}
                disabled={readOnly || isSubmitting}
                onChange={(value) => {
                  setError(null)

                  setForm((current) => ({
                    ...current,
                    noticeDate: value ?? null,
                  }))
                }}
              />

              <p className='text-xs text-muted-foreground'>
                {t('noticeDateSub')}
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='offboarding-effective-date'>
                {t('lastActiveDay')}

                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <DatePicker
                id='offboarding-effective-date'
                value={form.effectiveDate || null}
                disabled={
                  readOnly || isSubmitting || form.separationType === 'eoc'
                }
                onChange={(value) => {
                  setError(null)

                  setForm((current) => ({
                    ...current,
                    effectiveDate: value ?? '',
                  }))
                }}
              />

              {form.separationType === 'eoc' ? (
                <p className='text-xs text-muted-foreground'>
                  {t('eocDateHint')}
                </p>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  {t('lastActiveDaySub')}
                </p>
              )}
            </div>
          </div>

          {/* {error && (
            <p className='mt-4 text-xs font-medium text-destructive'>{error}</p>
          )} */}
        </Section>

        {/* ------------------------------------------------ */}
        {/* Reason */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('reason')}
          description={t('reasonSub')}
          badge={common('optional')}
        >
          <div className='space-y-2'>
            <Label htmlFor='offboarding-reason'>{t('reason')}</Label>

            <Textarea
              id='offboarding-reason'
              value={form.reason}
              disabled={readOnly || isSubmitting}
              maxLength={2000}
              rows={4}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }}
              placeholder={t('reasonPlaceholder')}
            />

            <div className='flex justify-end'>
              <span className='text-xs tabular-nums text-muted-foreground'>
                {form.reason.length} / 2000
              </span>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Remarks */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('remarks')}
          description={t('remarksSub')}
          badge={common('optional')}
        >
          <div className='space-y-2'>
            <Label htmlFor='offboarding-remarks'>{t('remarks')}</Label>

            <Textarea
              id='offboarding-remarks'
              value={form.remarks}
              disabled={readOnly || isSubmitting}
              maxLength={2000}
              rows={3}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  remarks: event.target.value,
                }))
              }}
              placeholder={t('remarksPlaceholder')}
            />

            <div className='flex justify-end'>
              <span className='text-xs tabular-nums text-muted-foreground'>
                {form.remarks.length} / 2000
              </span>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Read-only workflow notice */}
        {/* ------------------------------------------------ */}

        {isPendingApproval && existing && (
          <section className='rounded-2xl border border-dashed bg-muted/10 px-5 py-4'>
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted'>
                <Clock3 className='size-4 text-muted-foreground' />
              </div>

              <div className='min-w-0'>
                <h3 className='text-sm font-semibold'>
                  {t('pendingApprovalTitle')}
                </h3>

                <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                  {t('pendingApprovalDescription')}
                </p>
              </div>
            </div>
          </section>
        )}

        {isApproved && existing && (
          <section className='rounded-2xl border border-dashed bg-muted/10 px-5 py-4'>
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted'>
                <CheckCircle2 className='size-4 text-muted-foreground' />
              </div>

              <div className='min-w-0'>
                <h3 className='text-sm font-semibold'>
                  {canCompleteNow
                    ? t('readyForCompletionTitle')
                    : t('approvedTitle')}
                </h3>

                <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                  {canCompleteNow
                    ? t('readyForCompletionDescription')
                    : t('approvedDescription', {
                        date: existing.effectiveDate,
                      })}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ------------------------------------------------ */}
      {/* New Separation */}
      {/* ------------------------------------------------ */}

      {!existing && (
        <Footer
          onCancel={closeDialog}
          onSave={handleSave}
          label={t('saveDraft')}
          savingLabel={t('saving')}
          disabled={isSubmitting}
          isSaving={isSubmitting}
          saveVariant='default'
          saveIcon={<UserX className='size-4' />}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* Draft */}
      {/* ------------------------------------------------ */}

      {isDraft && existing && (
        <div className='flex shrink-0 flex-col-reverse gap-3 border-t bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={closeDialog}
            >
              {common('close')}
            </Button>

            <Button
              type='button'
              variant='ghost'
              disabled={isSubmitting}
              className='text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => setConfirmAction('cancel')}
            >
              <Ban className='me-2 size-4' />

              {t('cancelOffboarding')}
            </Button>
          </div>

          <div className='flex flex-wrap justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={handleSave}
            >
              {t('saveChanges')}
            </Button>

            <Button
              type='button'
              disabled={isSubmitting}
              onClick={handleSubmitForApproval}
            >
              {submitMutation.isPending ? (
                <LoaderCircle className='me-2 size-4 animate-spin' />
              ) : (
                <Send className='me-2 size-4' />
              )}

              {t('submitForApproval')}
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Pending Approval */}
      {/* ------------------------------------------------ */}

      {isPendingApproval && existing && (
        <div className='flex shrink-0 flex-col-reverse gap-3 border-t bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={closeDialog}
            >
              {common('close')}
            </Button>

            <Button
              type='button'
              variant='ghost'
              disabled={isSubmitting}
              className='text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => setConfirmAction('cancel')}
            >
              <Ban className='me-2 size-4' />

              {t('cancelOffboarding')}
            </Button>
          </div>

          <Button type='button' disabled={isSubmitting} onClick={handleApprove}>
            {approveMutation.isPending ? (
              <LoaderCircle className='me-2 size-4 animate-spin' />
            ) : (
              <CheckCircle2 className='me-2 size-4' />
            )}

            {t('approve')}
          </Button>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Approved */}
      {/* ------------------------------------------------ */}

      {isApproved && existing && (
        <div className='flex shrink-0 flex-col gap-3 border-t bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={closeDialog}
            >
              {common('close')}
            </Button>

            <Button
              type='button'
              variant='ghost'
              disabled={isSubmitting}
              className='text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => setConfirmAction('cancel')}
            >
              <Ban className='me-2 size-4' />

              {t('cancelOffboarding')}
            </Button>
          </div>

          {canCompleteNow ? (
            <Button
              type='button'
              variant='destructive'
              disabled={isSubmitting}
              onClick={() => setConfirmAction('complete')}
            >
              {completeMutation.isPending ? (
                <LoaderCircle className='me-2 size-4 animate-spin' />
              ) : (
                <CheckCircle2 className='me-2 size-4' />
              )}

              {t('completeSeparation')}
            </Button>
          ) : (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Clock3 className='size-4' />

              {t('scheduledCompletion', {
                date: existing.effectiveDate,
              })}
            </div>
          )}
        </div>
      )}

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setConfirmAction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'complete'
                ? t('completeConfirmTitle')
                : t('cancelConfirmTitle')}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {confirmAction === 'complete'
                ? t('completeConfirmDescription', {
                    employee: employeeName,
                    date: existing?.effectiveDate ?? '',
                  })
                : t('cancelConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {common('cancel')}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isSubmitting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={(event) => {
                event.preventDefault()

                void executeConfirmedAction()
              }}
            >
              {confirmAction === 'complete'
                ? t('completeSeparation')
                : t('cancelOffboarding')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export function OffboardingDialog(props: Props) {
  const t = useTranslations('offboarding')

  // const { data: separations = [], isLoading } = useEmploymentSeparations(
  //   props.employmentId,
  //   props.open,
  // )
  const {
    data: separations = [],
    isLoading,
    isError,
    error,
  } = useEmploymentSeparations(props.employmentId, props.open)

  const existing = separations.find((item) =>
    openStatuses.includes(item.status),
  )

  /*
   * Critical:
   *
   * When React Query changes from
   * "no separation loaded yet" to an
   * existing separation, the key changes
   * and the form is remounted with the
   * correct initial values.
   */
  const dialogKey = `${props.employmentId}:${existing?.id ?? 'new'}`

  return (
    // <FormDialog
    //   open={props.open}
    //   onOpenChange={props.onOpenChange}
    //   title={t('title')}
    //   description={t('description', {
    //     employee: props.employeeName,
    //   })}
    //   className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
    //   headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    // >
    //   {props.open &&
    //     (isLoading ? (
    //       <div className='flex min-h-72 flex-1 items-center justify-center'>
    //         <LoaderCircle className='size-6 animate-spin text-muted-foreground' />
    //       </div>
    //     ) : (
    //       <OffboardingDialogContent
    //         key={dialogKey}
    //         {...props}
    //         existing={existing}
    //       />
    //     ))}
    // </FormDialog>
    <FormDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('title')}
      description={t('description', {
        employee: props.employeeName,
      })}
      className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {props.open &&
        (isLoading ? (
          <div className='flex min-h-72 flex-1 items-center justify-center'>
            <LoaderCircle className='size-6 animate-spin text-muted-foreground' />
          </div>
        ) : isError ? (
          <div className='flex min-h-72 flex-1 flex-col items-center justify-center gap-3 px-6 text-center'>
            <div className='text-sm font-semibold text-destructive'>
              {t('loadFailed')}
            </div>

            <p className='max-w-md text-sm text-muted-foreground'>
              {t('loadFailedDescription')}
            </p>

            <Button
              type='button'
              variant='outline'
              onClick={() => props.onOpenChange(false)}
            >
              {t('close')}
            </Button>
          </div>
        ) : (
          <OffboardingDialogContent
            key={dialogKey}
            {...props}
            existing={existing}
          />
        ))}
    </FormDialog>
  )
}
