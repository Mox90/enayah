// enayah-frontend/src/modules/hr/offboarding/components/offboarding-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { AxiosError } from 'axios'
import {
  Ban,
  CheckCircle2,
  ChevronsUpDown,
  Clock3,
  LoaderCircle,
  Send,
  UserX,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'

import { DatePicker } from '@/components/dialogs/date-picker'
import { Footer } from '@/components/footer/footer'
import { FormDialog } from '@/components/forms'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  employmentSeparationTypeValues,
  type CreateSeparationPayload,
  type EmploymentSeparation,
  type EmploymentSeparationReasonCode,
  type EmploymentSeparationStatus,
  type EmploymentSeparationType,
} from '../types/offboarding.types'

import { separationTypeConfigs } from '../config/separation-reasons.config'

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
/* Types                                                                      */
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

  primaryReasonCode: EmploymentSeparationReasonCode | null
  contributingReasonCodes: EmploymentSeparationReasonCode[]

  /**
   * Optional narrative explanation.
   */
  reason: string

  /**
   * Internal HR remarks.
   */
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
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const openStatuses: EmploymentSeparationStatus[] = [
  'draft',
  'pending_approval',
  'approved',
]

type ConfirmAction = 'cancel' | 'complete' | null

/* -------------------------------------------------------------------------- */
/* UI Helpers                                                                 */
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
/* Form Initialization                                                        */
/* -------------------------------------------------------------------------- */

function createInitialForm(existing?: EmploymentSeparation): FormState {
  if (existing) {
    const primaryReason = existing.reasons?.find((reason) => reason.isPrimary)

    const contributingReasonCodes =
      existing.reasons
        ?.filter((reason) => !reason.isPrimary)
        .map((reason) => reason.reasonCode) ?? []

    return {
      separationType: existing.separationType,
      noticeDate: existing.noticeDate,
      effectiveDate: existing.effectiveDate,
      primaryReasonCode: primaryReason?.reasonCode ?? null,
      contributingReasonCodes,
      reason: existing.reason ?? '',
      remarks: existing.remarks ?? '',
    }
  }

  return {
    separationType: 'resignation',
    noticeDate: null,
    effectiveDate: '',
    primaryReasonCode: null,
    contributingReasonCodes: [],
    reason: '',
    remarks: '',
  }
}

/* -------------------------------------------------------------------------- */
/* Dialog Content                                                             */
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

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                 */
  /* ------------------------------------------------------------------------ */

  const createMutation = useCreateSeparation(employmentId)
  const updateMutation = useUpdateSeparation(employmentId)
  const submitMutation = useSubmitSeparation(employmentId)
  const approveMutation = useApproveSeparation(employmentId)
  const cancelMutation = useCancelSeparation(employmentId)
  const completeMutation = useCompleteSeparation(employmentId)

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  const [form, setForm] = useState<FormState>(() => createInitialForm(existing))
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [contributingOpen, setContributingOpen] = useState(false)

  /* ------------------------------------------------------------------------ */
  /* Workflow state                                                            */
  /* ------------------------------------------------------------------------ */

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending ||
    cancelMutation.isPending ||
    completeMutation.isPending

  const isDraft = existing?.status === 'draft'
  const isPendingApproval = existing?.status === 'pending_approval'
  const isApproved = existing?.status === 'approved'

  /**
   * Once submitted / approved, employee-profile
   * offboarding becomes read-only.
   *
   * The dedicated offboarding workspace may
   * eventually own the approval workflow.
   */
  const readOnly = isPendingApproval || isApproved
  const today = getTodayInRiyadh()
  const canCompleteNow = Boolean(
    isApproved && existing && existing.effectiveDate <= today,
  )

  /* ------------------------------------------------------------------------ */
  /* Separation Labels                                                        */
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

  /* ------------------------------------------------------------------------ */
  /* Reason Labels                                                            */
  /* ------------------------------------------------------------------------ */

  const reasonLabels: Record<EmploymentSeparationReasonCode, string> = {
    standard_expiry: t('reasons.standardExpiry'),
    higher_pay: t('reasons.higherPay'),
    alternative_opportunity: t('reasons.alternativeOpportunity'),
    lack_recognition: t('reasons.lackRecognition'),
    lack_training_opportunities: t('reasons.lackTrainingOpportunities'),
    limited_career_advancement: t('reasons.limitedCareerAdvancement'),
    lack_professional_development_support: t(
      'reasons.lackProfessionalDevelopmentSupport',
    ),
    supervisor_management: t('reasons.supervisorManagement'),
    workload: t('reasons.workload'),
    type_of_work: t('reasons.typeOfWork'),
    employee_conflict: t('reasons.employeeConflict'),
    work_environment: t('reasons.workEnvironment'),
    relocation: t('reasons.relocation'),
    study: t('reasons.study'),
    personal_family: t('reasons.personalFamily'),
    employer_nonrenewal: t('reasons.employerNonRenewal'),
    amicable_separation: t('reasons.amicableSeparation'),
    restructuring: t('reasons.restructuring'),
    redundancy: t('reasons.redundancy'),
    layoff: t('reasons.layoff'),
    misconduct_cause: t('reasons.misconductCause'),
    probation_nonconfirmation: t('reasons.probationNonConfirmation'),
    statutory_age_retirement: t('reasons.statutoryAgeRetirement'),
    early_retirement: t('reasons.earlyRetirement'),
    transfer_other_facility: t('reasons.transferOtherFacility'),
    transfer_other_entity: t('reasons.transferOtherEntity'),
    death_of_employee: t('reasons.deathOfEmployee'),
    medical_unfitness: t('reasons.medicalUnfitness'),
    force_majeure: t('reasons.forceMajeure'),
    work_permit_revocation: t('reasons.workPermitRevocation'),
    legal_invalidation: t('reasons.legalInvalidation'),
    corporate_dissolution: t('reasons.corporateDissolution'),
  }

  /* ------------------------------------------------------------------------ */
  /* Selected Type Configuration                                              */
  /* ------------------------------------------------------------------------ */

  const separationConfig = separationTypeConfigs[form.separationType]

  /**
   * Widen the type here so TypeScript
   * does not infer the intersection of
   * all presetReason arrays as never.
   */
  const allowedReasons: readonly EmploymentSeparationReasonCode[] =
    separationConfig.presetReasons

  const availableContributingReasons = allowedReasons.filter(
    (reasonCode) =>
      reasonCode !== form.primaryReasonCode &&
      !form.contributingReasonCodes.includes(reasonCode),
  )

  const currentStatusLabel = existing
    ? t(`statuses.${existing.status}`)
    : undefined

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  function validate(options?: { requireReasons?: boolean }) {
    const requireReasons = options?.requireReasons ?? false

    // ----------------------------------
    // Effective date
    // ----------------------------------

    if (!form.effectiveDate) {
      return t('validation.effectiveDateRequired')
    }

    if (form.effectiveDate < employmentStartDate) {
      return t('validation.beforeEmploymentStart')
    }

    if (form.effectiveDate > contractEndDate) {
      return t('validation.afterContractEnd')
    }

    // ----------------------------------
    // Notice date
    // ----------------------------------

    if (separationConfig.requiresNoticeDate && !form.noticeDate) {
      return t('validation.noticeDateRequired')
    }

    if (form.noticeDate && form.noticeDate > form.effectiveDate) {
      return t('validation.noticeAfterEffectiveDate')
    }

    // ----------------------------------
    // EOC
    // ----------------------------------

    if (
      form.separationType === 'eoc' &&
      form.effectiveDate !== contractEndDate
    ) {
      return t('validation.eocMustMatchContractEnd')
    }

    // ----------------------------------
    // Structured reasons
    // ----------------------------------

    if (requireReasons && !form.primaryReasonCode) {
      return t('validation.primaryReasonRequired')
    }

    return null
  }

  /* ------------------------------------------------------------------------ */
  /* Build Payload                                                             */
  /* ------------------------------------------------------------------------ */

  function buildPayload(): CreateSeparationPayload {
    const reasons: NonNullable<CreateSeparationPayload['reasons']> = []

    if (form.primaryReasonCode) {
      reasons.push({
        reasonCode: form.primaryReasonCode,
        isPrimary: true,
      })
    }

    for (const reasonCode of form.contributingReasonCodes) {
      /**
       * Defensive check:
       *
       * The same reason must never be both
       * primary and contributing.
       */
      if (reasonCode === form.primaryReasonCode) {
        continue
      }

      reasons.push({
        reasonCode,
        isPrimary: false,
      })
    }

    return {
      separationType: form.separationType,
      noticeDate: form.noticeDate,
      effectiveDate: form.effectiveDate,
      reasons,
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

    /**
     * Draft:
     *
     * structured reasons may still
     * temporarily be empty.
     */
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

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                    */
  /* ------------------------------------------------------------------------ */

  async function handleSubmitForApproval() {
    if (!existing || existing.status !== 'draft' || isSubmitting) {
      return
    }

    setError(null)

    /**
     * Submission requires a
     * primary structured reason.
     */
    const validationError = validate({
      requireReasons: true,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      /**
       * Persist any unsaved edits,
       * including structured reasons,
       * before submission.
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

  /* ------------------------------------------------------------------------ */
  /* Approve                                                                   */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Confirmed Workflow Actions                                               */
  /* ------------------------------------------------------------------------ */

  async function executeConfirmedAction() {
    if (!existing || !confirmAction) {
      return
    }

    setError(null)

    try {
      // ----------------------------------
      // Cancel
      // ----------------------------------

      if (confirmAction === 'cancel') {
        await cancelMutation.mutateAsync(existing.id)
        toast.success(t('cancelledSuccessfully'))
        setConfirmAction(null)
        onOpenChange(false)
        return
      }

      // ----------------------------------
      // Complete
      // ----------------------------------

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

  /* ------------------------------------------------------------------------ */
  /* Close                                                                     */
  /* ------------------------------------------------------------------------ */

  function closeDialog() {
    if (isSubmitting) {
      return
    }

    onOpenChange(false)
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

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

        {/* ------------------------------------------------ */}
        {/* Error */}
        {/* ------------------------------------------------ */}

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
              dir={isRtl ? 'rtl' : 'ltr'}
              onValueChange={(value) => {
                const separationType = value as EmploymentSeparationType
                const nextConfig = separationTypeConfigs[separationType]
                const nextAllowedReasons: readonly EmploymentSeparationReasonCode[] =
                  nextConfig.presetReasons
                setError(null)
                setContributingOpen(false)
                setForm((current) => {
                  /*
                   * Preserve the current primary reason
                   * only when it is also valid for the
                   * newly selected separation type.
                   */
                  const currentPrimaryIsStillValid =
                    current.primaryReasonCode !== null &&
                    nextAllowedReasons.includes(current.primaryReasonCode)
                  /*
                   * If the new type has only one valid
                   * reason, automatically select it.
                   *
                   * Example:
                   * death -> death_of_employee
                   */
                  const soleReason =
                    nextAllowedReasons.length === 1
                      ? nextAllowedReasons[0]
                      : null
                  const primaryReasonCode = currentPrimaryIsStillValid
                    ? current.primaryReasonCode
                    : soleReason
                  /*
                   * Preserve contributing factors only
                   * when they remain valid under the new
                   * type and are not the new primary.
                   */
                  const contributingReasonCodes =
                    current.contributingReasonCodes.filter(
                      (reasonCode) =>
                        nextAllowedReasons.includes(reasonCode) &&
                        reasonCode !== primaryReasonCode,
                    )
                  return {
                    ...current,
                    separationType,
                    primaryReasonCode,
                    contributingReasonCodes,
                    effectiveDate:
                      separationType === 'eoc'
                        ? contractEndDate
                        : current.effectiveDate,
                  }
                })
              }}
            >
              <SelectTrigger
                id='offboarding-separation-type'
                className='w-full data-[size=default]:h-12 bg-transparent hover:bg-transparent focus:bg-transparent dark:bg-transparent'
              >
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
            {/* Notice date */}

            <div className='space-y-2'>
              <Label htmlFor='offboarding-notice-date'>
                {t('noticeDate')}

                {separationConfig.requiresNoticeDate && (
                  <span className='ms-1 text-destructive'>*</span>
                )}
              </Label>

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
                {separationConfig.requiresNoticeDate
                  ? t('noticeDateRequiredSub')
                  : t('noticeDateSub')}
              </p>
            </div>

            {/* Effective date */}

            <div className='space-y-2'>
              <Label htmlFor='offboarding-effective-date'>
                {t('lastActiveDay')}

                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <DatePicker
                id='offboarding-effective-date'
                value={form.effectiveDate || null}
                disabled={
                  readOnly || isSubmitting //|| form.separationType === 'eoc'
                }
                minDate={
                  form.separationType === 'eoc'
                    ? contractEndDate
                    : employmentStartDate
                }
                maxDate={contractEndDate}
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
        </Section>

        {/* ------------------------------------------------ */}
        {/* Structured Separation Reasons */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('separationReasons')}
          description={t('separationReasonsSub')}
        >
          <div className='space-y-6'>
            {/* -------------------------------------------- */}
            {/* Primary Reason */}
            {/* -------------------------------------------- */}

            <div className='space-y-2'>
              <Label htmlFor='offboarding-primary-reason'>
                {t('primaryReason')}

                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Select
                disabled={readOnly || isSubmitting}
                value={form.primaryReasonCode ?? ''}
                dir={isRtl ? 'rtl' : 'ltr'}
                onValueChange={(value) => {
                  const reasonCode = value as EmploymentSeparationReasonCode
                  setContributingOpen(false)
                  setError(null)
                  setForm((current) => ({
                    ...current,
                    primaryReasonCode: reasonCode,

                    /**
                     * A reason cannot be
                     * simultaneously primary
                     * and contributing.
                     */
                    contributingReasonCodes:
                      current.contributingReasonCodes.filter(
                        (item) => item !== reasonCode,
                      ),
                  }))
                }}
              >
                <SelectTrigger
                  id='offboarding-primary-reason'
                  className='w-full data-[size=default]:h-12 bg-transparent hover:bg-transparent focus:bg-transparent dark:bg-transparent'
                >
                  <SelectValue placeholder={t('selectPrimaryReason')} />
                </SelectTrigger>

                <SelectContent>
                  {allowedReasons.map((reasonCode) => (
                    <SelectItem key={reasonCode} value={reasonCode}>
                      {reasonLabels[reasonCode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className='text-xs leading-relaxed text-muted-foreground'>
                {t('primaryReasonSub')}
              </p>
            </div>

            {/* -------------------------------------------- */}
            {/* Contributing Factors */}
            {/* -------------------------------------------- */}

            {form.primaryReasonCode !== null &&
              (allowedReasons.length > 1 ||
                form.contributingReasonCodes.length > 0) && (
                <div className='space-y-4'>
                  {/* -------------------------------------------- */}
                  {/* Header */}
                  {/* -------------------------------------------- */}

                  <div className='space-y-1'>
                    <Label htmlFor='offboarding-contributing-reasons'>
                      {t('contributingReasons')}
                    </Label>

                    <p className='text-xs leading-relaxed text-muted-foreground'>
                      {t('contributingReasonsSub')}
                    </p>
                  </div>

                  {/* -------------------------------------------- */}
                  {/* Searchable Combobox */}
                  {/* -------------------------------------------- */}

                  {!readOnly && (
                    <Popover
                      modal
                      open={contributingOpen}
                      onOpenChange={setContributingOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id='offboarding-contributing-reasons'
                          type='button'
                          variant='outline'
                          role='combobox'
                          dir={isRtl ? 'rtl' : 'ltr'}
                          aria-expanded={contributingOpen}
                          disabled={
                            isSubmitting ||
                            availableContributingReasons.length === 0
                          }
                          className='h-12 w-full justify-between gap-2 font-normal bg-transparent hover:bg-transparent focus:bg-transparent dark:bg-transparent'
                        >
                          <span className='truncate text-muted-foreground'>
                            {availableContributingReasons.length === 0
                              ? t('allContributingReasonsSelected')
                              : t('selectContributingReason')}
                          </span>

                          <ChevronsUpDown className='size-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        //align='start'
                        dir={isRtl ? 'rtl' : 'ltr'}
                        align={isRtl ? 'end' : 'start'}
                        sideOffset={4}
                        className='w-[var(--radix-popover-trigger-width)] p-0'
                      >
                        <Command>
                          {/* ------------------------------------ */}
                          {/* Search */}
                          {/* ------------------------------------ */}

                          <CommandInput
                            placeholder={t('searchContributingReasons')}
                          />

                          <CommandList>
                            <CommandEmpty>
                              {t('noContributingReasons')}
                            </CommandEmpty>

                            <CommandGroup>
                              {availableContributingReasons.map(
                                (reasonCode) => (
                                  <CommandItem
                                    key={reasonCode}
                                    value={`${reasonLabels[reasonCode]} ${reasonCode.replaceAll('_', ' ')}`}
                                    onSelect={() => {
                                      setError(null)

                                      setForm((current) => {
                                        // Prevent duplicate selections.
                                        if (
                                          current.contributingReasonCodes.includes(
                                            reasonCode,
                                          )
                                        ) {
                                          return current
                                        }

                                        // A primary reason cannot also
                                        // be a contributing factor.
                                        if (
                                          current.primaryReasonCode ===
                                          reasonCode
                                        ) {
                                          return current
                                        }

                                        // Verify the option is still
                                        // valid for the current type.
                                        const allowed: readonly EmploymentSeparationReasonCode[] =
                                          separationTypeConfigs[
                                            current.separationType
                                          ].presetReasons

                                        if (!allowed.includes(reasonCode)) {
                                          return current
                                        }

                                        return {
                                          ...current,
                                          contributingReasonCodes: [
                                            ...current.contributingReasonCodes,
                                            reasonCode,
                                          ],
                                        }
                                      })

                                      // Close after selection.
                                      setContributingOpen(false)
                                    }}
                                    className='cursor-pointer'
                                  >
                                    <span className='flex-1 text-start'>
                                      {reasonLabels[reasonCode]}
                                    </span>
                                  </CommandItem>
                                ),
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* -------------------------------------------- */}
                  {/* Selected Factors */}
                  {/* -------------------------------------------- */}

                  {form.contributingReasonCodes.length > 0 && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <p className='text-xs font-medium text-muted-foreground'>
                          {t('selectedContributingReasons')}
                        </p>

                        <span className='text-xs tabular-nums text-muted-foreground'>
                          {form.contributingReasonCodes.length}
                        </span>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        {form.contributingReasonCodes.map((reasonCode) => (
                          <div
                            key={reasonCode}
                            className='inline-flex max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 py-1.5 ps-3 pe-1.5'
                          >
                            {/* Factor label */}

                            <span className='min-w-0 text-sm font-medium leading-5 text-foreground'>
                              {reasonLabels[reasonCode]}
                            </span>

                            {/* Remove button */}

                            {!readOnly && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={isSubmitting}
                                aria-label={`${t('removeContributingReason')}: ${
                                  reasonLabels[reasonCode]
                                }`}
                                onClick={() => {
                                  setError(null)

                                  setForm((current) => ({
                                    ...current,
                                    contributingReasonCodes:
                                      current.contributingReasonCodes.filter(
                                        (item) => item !== reasonCode,
                                      ),
                                  }))
                                }}
                                className='size-6 shrink-0 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                              >
                                <X className='size-3.5' />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* -------------------------------------------- */}
            {/* Selected summary */}
            {/* -------------------------------------------- */}

            {form.primaryReasonCode && (
              <div className='rounded-xl border bg-muted/20 px-4 py-3'>
                <div className='text-xs font-medium text-muted-foreground'>
                  {t('selectedReasonSummary')}
                </div>

                <div className='mt-2 space-y-1.5'>
                  <div className='text-sm'>
                    <span className='font-medium'>{t('primaryReason')}:</span>{' '}
                    {reasonLabels[form.primaryReasonCode]}
                  </div>

                  {form.contributingReasonCodes.length > 0 && (
                    <div className='text-sm'>
                      <span className='font-medium'>
                        {t('contributingReasons')}:
                      </span>{' '}
                      {form.contributingReasonCodes
                        .map((reasonCode) => reasonLabels[reasonCode])
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Additional Reason Details */}
        {/* ------------------------------------------------ */}

        <Section
          title={t('additionalReasonDetails')}
          description={t('additionalReasonDetailsSub')}
          badge={common('optional')}
        >
          <div className='space-y-2'>
            <Label htmlFor='offboarding-reason'>
              {t('additionalReasonDetails')}
            </Label>

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
              placeholder={t('additionalReasonDetailsPlaceholder')}
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
        {/* Read-only Workflow Notice */}
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

      {/* ------------------------------------------------ */}
      {/* Confirmation */}
      {/* ------------------------------------------------ */}

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
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

export function OffboardingDialog(props: Props) {
  const t = useTranslations('offboarding')

  const common = useTranslations('common')

  const {
    data: separations = [],
    isLoading,
    isError,
  } = useEmploymentSeparations(props.employmentId, props.open)

  /**
   * One open process is permitted
   * per employment by the backend
   * partial unique constraint.
   */
  const existing = separations.find((item) =>
    openStatuses.includes(item.status),
  )

  /**
   * Critical:
   *
   * When React Query changes from
   * "no separation loaded yet" to an
   * existing separation, the key changes
   * and the form remounts with the correct
   * initial state, including structured
   * reasons.
   */
  const dialogKey = `${props.employmentId}:${existing?.id ?? 'new'}`

  return (
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
              {common('close')}
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
