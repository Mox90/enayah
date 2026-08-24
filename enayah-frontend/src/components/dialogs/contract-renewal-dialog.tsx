// enayah-frontend/src/components/dialogs/contract-renewal-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { gsap } from 'gsap'

import { RefreshCcw, Trash2, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { AllowanceTypeCombobox } from '@/components/comboboxes/allowance-combobox'
import { FormDialog } from '@/components/forms'
import { SaudiRiyalSymbol } from '@/components/icons/saudi-riyal-symbol'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useAllowanceOptions } from '@/modules/hr/compensations/utils/allowance-options'
import type {
  ContractMovementActionType,
  RenewContractPayload,
} from '@/modules/hr/contracts/types/contract-renewal.types'
import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'
import { PositionCombobox } from '@/modules/hr/positions/components/position-combobox'

import { Footer } from '../footer/footer'
import { DatePicker } from './date-picker'
import { StaffCategory } from '@/modules/hr/employments/types/employment.types'
import { useGsapBounceIn } from '@/hooks/use-gsap-bounce-in'

//type StaffCategory = 'civilian' | 'military' | 'contractual'

type AllowanceValue = {
  type: string
  amount: number | string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentContractId: string
  staffCategory: StaffCategory
  currentPositionItemId?: string | null
  currentItemNumber?: string | null
  currentDepartmentId?: string | null
  currentPositionId?: string | null
  currentDepartmentName?: string | null
  currentPositionTitle?: string | null
  currentBaseSalary?: number | string | null
  currentAllowances?: AllowanceValue[]
  defaultStartDate: string
  onSubmit: (payload: RenewContractPayload) => void | Promise<void>
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

interface ActionOptionProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
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

function ActionOption({
  id,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: ActionOptionProps) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-start gap-3 rounded-xl border p-4 transition-colors',
        checked ? 'border-primary/40 bg-primary/5' : 'bg-background',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-muted/30',
      ].join(' ')}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        className='mt-0.5'
      />

      <span className='min-w-0'>
        <span className='block text-sm font-medium'>{label}</span>

        <span className='mt-1 block text-xs leading-relaxed text-muted-foreground'>
          {description}
        </span>
      </span>
    </label>
  )
}

function addMonthsMinusOneDay(startDate: string, months: number) {
  if (!startDate) {
    return null
  }

  /*
   * Use UTC operations so a date-only business
   * value does not shift because of browser timezone.
   */
  const date = new Date(`${startDate}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  date.setUTCDate(date.getUTCDate() - 1)

  return date.toISOString().slice(0, 10)
}

function normalizeAllowances(allowances: AllowanceValue[]) {
  return allowances
    .map((allowance) => ({
      type: allowance.type,
      amount: Number(allowance.amount),
    }))
    .sort((a, b) => a.type.localeCompare(b.type))
}

/* -------------------------------------------------------------------------- */
/* Dialog Content                                                              */
/* -------------------------------------------------------------------------- */

function ContractRenewalDialogContent({
  onOpenChange,
  onSubmit,
  currentContractId,
  staffCategory,
  currentPositionItemId,
  currentItemNumber,
  currentDepartmentId,
  currentPositionId,
  currentDepartmentName,
  currentPositionTitle,
  currentBaseSalary,
  currentAllowances = [],
  defaultStartDate,
}: Props) {
  const ct = useTranslations('contracts')
  const et = useTranslations('employees')
  const common = useTranslations('common')
  const at = useTranslations('allowanceTypes')
  const cmt = useTranslations('compensations')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const allowanceOptions = useAllowanceOptions()

  // --------------------------------------------------------------------------
  // Contract
  // --------------------------------------------------------------------------

  /*
   * Renewal start date is SYSTEM CONTROLLED.
   *
   * Parent calculates:
   *
   * current contract endDate + 1 day
   */
  const startDate = defaultStartDate
  const [durationMonths, setDurationMonths] = useState<'3' | '6' | '12'>('12')
  const [endDate, setEndDate] = useState<string | null>(
    addMonthsMinusOneDay(defaultStartDate, 12),
  )

  // --------------------------------------------------------------------------
  // Movement actions
  // --------------------------------------------------------------------------

  /*
   * [] = normal renewal.
   */
  const [actions, setActions] = useState<ContractMovementActionType[]>([])
  // Promotion / demotion target legal position.
  const [newPositionId, setNewPositionId] = useState<string | null>(null)
  const [newPositionTitle, setNewPositionTitle] = useState<string | null>(null)
  // Transfer target legal department.
  const [newDepartmentId, setNewDepartmentId] = useState<string | null>(null)
  const [newDepartmentName, setNewDepartmentName] = useState<string | null>(
    null,
  )

  const isMilitary = staffCategory === 'military'

  const requiresPositionItem =
    staffCategory === 'civilian' || staffCategory === 'contractual'

  // --------------------------------------------------------------------------
  // PCN alignment
  // --------------------------------------------------------------------------

  const [alignedPositionItemId, setAlignedPositionItemId] = useState<
    string | null
  >(null)

  const [alignedItemNumber, setAlignedItemNumber] = useState<string | null>(
    null,
  )

  const [alignedDepartmentId, setAlignedDepartmentId] = useState<string | null>(
    null,
  )

  const [alignedDepartmentName, setAlignedDepartmentName] = useState<
    string | null
  >(null)

  const [alignedPositionId, setAlignedPositionId] = useState<string | null>(
    null,
  )

  const [alignedPositionTitle, setAlignedPositionTitle] = useState<
    string | null
  >(null)

  // --------------------------------------------------------------------------
  // Compensation
  // --------------------------------------------------------------------------

  const [compensationEnabled, setCompensationEnabled] = useState(false)

  const [baseSalary, setBaseSalary] = useState(
    currentBaseSalary !== null && currentBaseSalary !== undefined
      ? String(currentBaseSalary)
      : '',
  )

  const [allowances, setAllowances] = useState<
    {
      type: string
      amount: number
    }[]
  >(
    currentAllowances.map((allowance) => ({
      type: allowance.type,
      amount: Number(allowance.amount),
    })),
  )

  // --------------------------------------------------------------------------
  // Remarks / submission
  // --------------------------------------------------------------------------

  const [remarks, setRemarks] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmWithoutCompensationOpen, setConfirmWithoutCompensationOpen] =
    useState(false)
  const [isConfirmAnimating, setIsConfirmAnimating] = useState(false)

  const confirmDialogRef = useRef<HTMLDivElement>(null)
  const confirmBounceRef = useGsapBounceIn<HTMLDivElement>({
    enabled: confirmWithoutCompensationOpen,
  })

  const setConfirmDialogRef = (element: HTMLDivElement | null) => {
    confirmDialogRef.current = element
    confirmBounceRef(element)
  }

  // --------------------------------------------------------------------------
  // Action helpers
  // --------------------------------------------------------------------------

  const hasPromotion = actions.includes('promotion')
  const hasDemotion = actions.includes('demotion')
  const hasTransfer = actions.includes('transfer')
  const hasPcnAlignment = actions.includes('pcn_alignment')
  const isNormalRenewal = actions.length === 0

  // --------------------------------------------------------------------------
  // Resulting legal assignment
  // --------------------------------------------------------------------------

  /*
   * IMPORTANT:
   *
   * Promotion / demotion:
   *   position changes,
   *   PCN may remain unchanged.
   *
   * Transfer:
   *   department changes,
   *   PCN may remain unchanged.
   *
   * PCN alignment:
   *   selected PCN becomes authoritative
   *   for PCN + department + position.
   */

  const finalPositionItemId = hasPcnAlignment
    ? alignedPositionItemId
    : (currentPositionItemId ?? null)

  const finalItemNumber = hasPcnAlignment
    ? alignedItemNumber
    : currentItemNumber

  const finalDepartmentId = hasPcnAlignment
    ? alignedDepartmentId
    : hasTransfer
      ? newDepartmentId
      : (currentDepartmentId ?? null)

  const finalDepartmentName = hasPcnAlignment
    ? alignedDepartmentName
    : hasTransfer
      ? newDepartmentName
      : currentDepartmentName

  const finalPositionId = hasPcnAlignment
    ? alignedPositionId
    : hasPromotion || hasDemotion
      ? newPositionId
      : (currentPositionId ?? null)

  const finalPositionTitle = hasPcnAlignment
    ? alignedPositionTitle
    : hasPromotion || hasDemotion
      ? newPositionTitle
      : currentPositionTitle

  // --------------------------------------------------------------------------
  // Determine actual changes
  // --------------------------------------------------------------------------

  const positionItemChanged =
    finalPositionItemId !== (currentPositionItemId ?? null)
  const departmentChanged = finalDepartmentId !== (currentDepartmentId ?? null)
  const positionChanged = finalPositionId !== (currentPositionId ?? null)

  // --------------------------------------------------------------------------
  // Compensation comparison
  // --------------------------------------------------------------------------

  const currentCompensationSnapshot = JSON.stringify({
    baseSalary:
      currentBaseSalary === null || currentBaseSalary === undefined
        ? null
        : Number(currentBaseSalary),

    allowances: normalizeAllowances(currentAllowances),
  })

  const draftCompensationSnapshot = JSON.stringify({
    baseSalary: baseSalary.trim() === '' ? null : Number(baseSalary),
    allowances: normalizeAllowances(allowances),
  })

  /*
   * Opening the compensation editor itself does
   * not mean compensation changed.
   *
   * We only send compensation if values differ
   * from the current compensation.
   */
  const compensationChanged =
    compensationEnabled &&
    currentCompensationSnapshot !== draftCompensationSnapshot

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  let actionValidationMessage: string | null = null

  if (hasPcnAlignment && !alignedPositionItemId) {
    actionValidationMessage = ct('pcnAlignmentTargetRequired')
  } else if (
    !hasPcnAlignment &&
    (hasPromotion || hasDemotion) &&
    !newPositionId
  ) {
    actionValidationMessage = ct('newPositionRequired')
  } else if (!hasPcnAlignment && hasTransfer && !newDepartmentId) {
    actionValidationMessage = ct('newDepartmentRequired')
  } else if ((hasPromotion || hasDemotion) && !positionChanged) {
    actionValidationMessage = ct('promotionDemotionRequiresPositionChange')
  } else if (hasTransfer && !departmentChanged) {
    actionValidationMessage = ct('transferRequiresDepartmentChange')
  } else if (
    hasPcnAlignment &&
    !positionItemChanged &&
    !departmentChanged &&
    !positionChanged
  ) {
    actionValidationMessage = ct('pcnAlignmentNoChange')
  }

  const positionItemInvalid = requiresPositionItem && !finalPositionItemId

  const compensationInvalid =
    compensationEnabled &&
    (baseSalary.trim() === '' ||
      Number(baseSalary) <= 0 ||
      allowances.some(
        (allowance) => !allowance.type.trim() || Number(allowance.amount) <= 0,
      ))

  const formInvalid =
    !startDate ||
    !endDate ||
    endDate < startDate ||
    !finalDepartmentId ||
    !finalPositionId ||
    positionItemInvalid ||
    Boolean(actionValidationMessage) ||
    compensationInvalid

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  function toggleAction(action: ContractMovementActionType) {
    setActions((current) => {
      if (current.includes(action)) {
        return current.filter((item) => item !== action)
      }

      /*
       * Defense in depth:
       *
       * UI disables the opposite action,
       * but state also guarantees that both
       * can never coexist.
       */
      if (action === 'promotion') {
        return [...current.filter((item) => item !== 'demotion'), 'promotion']
      }

      if (action === 'demotion') {
        return [...current.filter((item) => item !== 'promotion'), 'demotion']
      }

      return [...current, action]
    })
  }

  // --------------------------------------------------------------------------
  // Contract dates
  // --------------------------------------------------------------------------

  function updateDuration(value: '3' | '6' | '12') {
    setDurationMonths(value)

    setEndDate(addMonthsMinusOneDay(startDate, Number(value)))
  }

  // --------------------------------------------------------------------------
  // Allowances
  // --------------------------------------------------------------------------

  function addAllowance() {
    setAllowances((current) => [
      ...current,
      {
        type: '',
        amount: 0,
      },
    ])
  }

  function updateAllowance(
    index: number,
    field: 'type' | 'amount',
    value: string,
  ) {
    setAllowances((current) =>
      current.map((allowance, allowanceIndex) =>
        allowanceIndex === index
          ? {
              ...allowance,

              [field]: field === 'amount' ? Number(value) : value,
            }
          : allowance,
      ),
    )
  }

  function removeAllowance(index: number) {
    setAllowances((current) =>
      current.filter((_, allowanceIndex) => allowanceIndex !== index),
    )
  }

  function getAvailableAllowanceTypes(currentIndex: number) {
    const selected = new Set(
      allowances
        .filter((_, index) => index !== currentIndex)
        .map((allowance) => allowance.type)
        .filter(Boolean),
    )

    return allowanceOptions.filter((option) => !selected.has(option.value))
  }

  function resetCompensation() {
    setCompensationEnabled(false)

    setBaseSalary(
      currentBaseSalary !== null && currentBaseSalary !== undefined
        ? String(currentBaseSalary)
        : '',
    )

    setAllowances(
      currentAllowances.map((allowance) => ({
        type: allowance.type,
        amount: Number(allowance.amount),
      })),
    )
  }

  // --------------------------------------------------------------------------
  // Display helpers
  // --------------------------------------------------------------------------

  function formatMoney(amount: number | string | null | undefined) {
    if (amount === null || amount === undefined || amount === '') {
      return '—'
    }

    return (
      <span
        className='inline-flex items-baseline gap-1.5 tabular-nums'
        dir='ltr'
        aria-label={`${amount} Saudi Riyal`}
      >
        <SaudiRiyalSymbol
          showAccessibleText={false}
          className='text-[0.95em] text-base'
        />
        <span>
          {Number(amount).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </span>
    )
  }

  function getAllowanceLabel(type: string) {
    return at.has(type) ? at(type) : type
  }

  function getCompensationReason() {
    if (actions.length === 0) {
      return 'Contract renewal'
    }

    return `Contract renewal with ${actions.join(', ')}`
  }

  // --------------------------------------------------------------------------
  // Payload
  // --------------------------------------------------------------------------

  function buildPayload(): RenewContractPayload {
    if (!endDate) {
      throw new Error('Renewal end date is required')
    }

    return {
      currentContractId,
      contract: {
        startDate,
        endDate,
        signedDate: null,
        notes: notes.trim() || null,
      },

      movement: {
        positionItemId: finalPositionItemId,
        officialDepartmentId: finalDepartmentId,
        officialPositionId: finalPositionId,
        /*
         * [] = normal renewal.
         */
        actions,
        remarks: remarks.trim() || null,
      },

      /*
       * IMPORTANT:
       *
       * If nothing changed, omit compensation.
       *
       * Backend then creates no new compensation
       * record and existing/latest compensation
       * remains effective.
       */
      compensation: compensationChanged
        ? {
            baseSalary: Number(baseSalary),
            reason: getCompensationReason(),
            allowances: allowances.map((allowance) => ({
              type: allowance.type,
              amount: Number(allowance.amount),
            })),
          }
        : undefined,

      /*
       * No appointment is sent automatically.
       *
       * Renewal legal movement and actual
       * operational assignment are separate.
       */
    }
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------

  async function submitRenewal() {
    if (isSubmitting || formInvalid) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(buildPayload())

      onOpenChange(false)
    } catch {
      /*
       * Keep dialog open.
       * Mutation hook handles backend toast.
       */
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit() {
    if (isSubmitting || formInvalid) {
      return
    }

    /*
     * Compensation is optional, but HR
     * must consciously confirm that no
     * compensation change is intended.
     */
    if (!compensationChanged) {
      setConfirmWithoutCompensationOpen(true)

      return
    }

    await submitRenewal()
  }

  function shootConfirmationAndSubmit() {
    if (isSubmitting || isConfirmAnimating) {
      return
    }

    const dialog = confirmDialogRef.current

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (!dialog || prefersReducedMotion) {
      setConfirmWithoutCompensationOpen(false)
      void submitRenewal()
      return
    }

    setIsConfirmAnimating(true)

    /*
     * Stop any remaining bounce-in animation before
     * starting the exit animation.
     */
    gsap.killTweensOf(dialog)

    gsap
      .timeline({
        defaults: {
          overwrite: 'auto',
        },

        onComplete: () => {
          setConfirmWithoutCompensationOpen(false)
          setIsConfirmAnimating(false)

          void submitRenewal()
        },
      })

      /*
       * Small recoil before shooting away.
       */
      .to(dialog, {
        x: isRtl ? 12 : -12,
        scale: 1.02,
        duration: 0.1,
        ease: 'power2.out',
      })

      /*
       * Shoot away from the screen.
       */
      .to(dialog, {
        x: isRtl ? -window.innerWidth * 1.15 : window.innerWidth * 1.15,
        y: -30,
        rotate: isRtl ? -6 : 6,
        scale: 0.94,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
      })
  }

  function closeDialog() {
    if (isSubmitting) {
      return
    }

    onOpenChange(false)
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        {/* ------------------------------------------------ */}
        {/* Contract Period */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('contractPeriod')}
          description={ct('renewalContractPeriodSub')}
        >
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            {/* Start Date */}

            <div className='space-y-2'>
              <Label>{ct('startDate')}</Label>

              <div className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'>
                <span className='text-sm tabular-nums' dir='ltr'>
                  {startDate || '—'}
                </span>

                <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                  {ct('systemDefined')}
                </span>
              </div>
            </div>

            {/* Duration */}

            <div className='space-y-2'>
              <Label>{ct('duration')}</Label>

              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={durationMonths}
                onValueChange={(value) =>
                  updateDuration(value as '3' | '6' | '12')
                }
              >
                <SelectTrigger className='w-full data-[size=default]:h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='3'>{ct('threeMonths')}</SelectItem>
                  <SelectItem value='6'>{ct('sixMonths')}</SelectItem>
                  <SelectItem value='12'>{ct('twelveMonths')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* End Date */}

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='renewal-end-date'>{ct('endDate')}</Label>

              <DatePicker
                id='renewal-end-date'
                value={endDate}
                onChange={setEndDate}
              />
            </div>

            {/* System Values */}

            <div className='grid grid-cols-1 gap-3 md:col-span-2 sm:grid-cols-2'>
              <ReadOnlyField
                label={ct('contractType')}
                value={
                  <span className='flex items-center justify-between gap-2'>
                    <span>{ct('renewal')}</span>

                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                      {ct('systemDefined')}
                    </span>
                  </span>
                }
              />

              <ReadOnlyField
                label={ct('movementType')}
                value={
                  <span className='flex items-center justify-between gap-2'>
                    <span>{ct('renewal')}</span>

                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                      {ct('systemDefined')}
                    </span>
                  </span>
                }
              />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Current Legal Assignment */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('currentLegalAssignment')}
          description={ct('currentLegalAssignmentSub')}
          badge={ct('current')}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <ReadOnlyField
              label={ct('legalDepartment')}
              value={currentDepartmentName ?? currentDepartmentId}
            />

            <ReadOnlyField
              label={ct('legalPosition')}
              value={currentPositionTitle ?? currentPositionId}
            />

            <ReadOnlyField
              label={et('pcnText')}
              value={
                currentItemNumber ??
                currentPositionItemId ??
                (isMilitary ? ct('noPcnAssignedMilitary') : '—')
              }
            />
          </div>

          {positionItemInvalid && (
            <p className='mt-3 text-xs font-medium text-destructive'>
              {ct('positionItemRequired')}
            </p>
          )}
        </Section>

        {/* ------------------------------------------------ */}
        {/* Renewal Actions */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('renewalActions')}
          description={ct('renewalActionsSub')}
          badge={isNormalRenewal ? ct('normalRenewal') : String(actions.length)}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <ActionOption
              id='renewal-action-promotion'
              label={ct('promotion')}
              description={ct('promotionActionSub')}
              checked={hasPromotion}
              disabled={hasDemotion || isSubmitting}
              onToggle={() => toggleAction('promotion')}
            />

            <ActionOption
              id='renewal-action-demotion'
              label={ct('demotion')}
              description={ct('demotionActionSub')}
              checked={hasDemotion}
              disabled={hasPromotion || isSubmitting}
              onToggle={() => toggleAction('demotion')}
            />

            <ActionOption
              id='renewal-action-transfer'
              label={ct('transfer')}
              description={ct('transferActionSub')}
              checked={hasTransfer}
              disabled={isSubmitting}
              onToggle={() => toggleAction('transfer')}
            />

            <ActionOption
              id='renewal-action-pcn-alignment'
              label={ct('pcn_alignment')}
              description={ct('pcnAlignmentActionSub')}
              checked={hasPcnAlignment}
              disabled={isSubmitting}
              onToggle={() => toggleAction('pcn_alignment')}
            />
          </div>

          {isNormalRenewal && (
            <div className='mt-4 rounded-lg border border-dashed bg-muted/10 px-4 py-3'>
              <p className='text-sm font-medium'>{ct('normalRenewal')}</p>

              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {ct('normalRenewalSub')}
              </p>
            </div>
          )}
        </Section>

        {/* ------------------------------------------------ */}
        {/* Promotion / Demotion */}
        {/* ------------------------------------------------ */}

        {!hasPcnAlignment && (hasPromotion || hasDemotion) && (
          <Section
            title={
              hasPromotion
                ? ct('newPositionAfterPromotion')
                : ct('newPositionAfterDemotion')
            }
            description={ct('newLegalPositionSub')}
          >
            <div className='space-y-2'>
              <Label>
                {ct('legalPosition')}

                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <PositionCombobox
                value={newPositionId}
                selectedLabel={newPositionTitle}
                onChange={(position) => {
                  setNewPositionId(position.id)

                  setNewPositionTitle(
                    isRtl
                      ? (position.titleAr ?? position.titleEn)
                      : (position.titleEn ?? position.titleAr),
                  )
                }}
              />
            </div>
          </Section>
        )}

        {/* ------------------------------------------------ */}
        {/* Transfer */}
        {/* ------------------------------------------------ */}

        {!hasPcnAlignment && hasTransfer && (
          <Section
            title={ct('newDepartmentAfterTransfer')}
            description={ct('newLegalDepartmentSub')}
          >
            <div className='space-y-2'>
              <Label>
                {ct('legalDepartment')}

                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <DepartmentCombobox
                value={newDepartmentId}
                selectedLabel={newDepartmentName}
                onChange={(department) => {
                  setNewDepartmentId(department.id)
                  setNewDepartmentName(
                    isRtl
                      ? (department.nameAr ?? department.nameEn)
                      : (department.nameEn ?? department.nameAr),
                  )
                }}
              />
            </div>
          </Section>
        )}

        {/* ------------------------------------------------ */}
        {/* PCN Alignment */}
        {/* ------------------------------------------------ */}

        {hasPcnAlignment && (
          <Section
            title={ct('newPcnAlignment')}
            description={ct('newPcnAlignmentSub')}
          >
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label>
                  {et('pcnText')}

                  <span className='ms-1 text-destructive'>*</span>
                </Label>

                <PositionItemCombobox
                  value={alignedPositionItemId}
                  selectedLabel={alignedItemNumber}
                  onChange={(item) => {
                    if (!item) {
                      setAlignedPositionItemId(null)
                      setAlignedItemNumber(null)
                      setAlignedDepartmentId(null)
                      setAlignedDepartmentName(null)
                      setAlignedPositionId(null)
                      setAlignedPositionTitle(null)

                      return
                    }

                    setAlignedPositionItemId(item.id)
                    setAlignedItemNumber(item.itemNumber)
                    setAlignedDepartmentId(item.departmentId)
                    setAlignedDepartmentName(
                      isRtl
                        ? (item.departmentNameAr ??
                            item.departmentNameEn ??
                            null)
                        : (item.departmentNameEn ??
                            item.departmentNameAr ??
                            null),
                    )

                    setAlignedPositionId(item.positionId)

                    setAlignedPositionTitle(
                      isRtl
                        ? (item.positionTitleAr ?? item.positionTitleEn ?? null)
                        : (item.positionTitleEn ??
                            item.positionTitleAr ??
                            null),
                    )
                  }}
                />
              </div>

              {alignedPositionItemId && (
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  <ReadOnlyField
                    label={ct('legalDepartment')}
                    value={
                      <span className='flex items-center justify-between gap-2'>
                        <span>{alignedDepartmentName ?? '—'}</span>

                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                          {ct('fromPcn')}
                        </span>
                      </span>
                    }
                  />

                  <ReadOnlyField
                    label={ct('legalPosition')}
                    value={
                      <span className='flex items-center justify-between gap-2'>
                        <span>{alignedPositionTitle ?? '—'}</span>

                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                          {ct('fromPcn')}
                        </span>
                      </span>
                    }
                  />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ------------------------------------------------ */}
        {/* Resulting Legal Assignment */}
        {/* ------------------------------------------------ */}

        {actions.length > 0 && (
          <Section
            title={ct('newLegalAssignment')}
            description={ct('newLegalAssignmentSub')}
          >
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <ReadOnlyField
                label={ct('legalDepartment')}
                value={finalDepartmentName ?? finalDepartmentId}
              />

              <ReadOnlyField
                label={ct('legalPosition')}
                value={finalPositionTitle ?? finalPositionId}
              />

              <ReadOnlyField
                label={et('pcnText')}
                value={finalItemNumber ?? finalPositionItemId}
              />
            </div>

            {actionValidationMessage && (
              <p className='mt-3 text-xs font-medium text-destructive'>
                {actionValidationMessage}
              </p>
            )}
          </Section>
        )}

        {/* ------------------------------------------------ */}
        {/* Compensation */}
        {/* ------------------------------------------------ */}

        <Section
          title={et('compensation')}
          description={ct('renewalCompensationSub')}
          badge={common('optional')}
        >
          {!compensationEnabled ? (
            <div className='space-y-5'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <ReadOnlyField
                  label={et('baseSalaryLabel')}
                  value={formatMoney(currentBaseSalary)}
                />

                <ReadOnlyField
                  label={et('allowancesLabel')}
                  value={currentAllowances.length}
                />
              </div>

              {currentAllowances.length > 0 && (
                <div className='space-y-2 border-t pt-4'>
                  {currentAllowances.map((allowance) => (
                    <div
                      key={allowance.type}
                      className='flex items-center justify-between gap-4 rounded-lg bg-muted/20 px-3 py-2.5'
                    >
                      <span className='text-sm'>
                        {getAllowanceLabel(allowance.type)}
                      </span>

                      <span className='text-sm font-medium'>
                        {formatMoney(allowance.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCompensationEnabled(true)}
                >
                  {ct('reviewChangeCompensation')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-5'>
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={resetCompensation}
                >
                  <X className='me-2 size-4' />

                  {ct('cancelCompensationChange')}
                </Button>
              </div>

              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                {/* Base Salary */}

                <div className='space-y-2'>
                  <Label htmlFor='renewal-base-salary'>
                    {et('baseSalaryLabel')}

                    <span className='ms-1 text-destructive'>*</span>
                  </Label>

                  <div className='relative'>
                    <span className='pointer-events-none absolute inset-y-0 start-3 z-10 flex items-center text-muted-foreground'>
                      <SaudiRiyalSymbol className='text-base' />
                    </span>

                    <Input
                      id='renewal-base-salary'
                      type='number'
                      min='0'
                      step='0.01'
                      inputMode='decimal'
                      className='h-11 ps-9'
                      value={baseSalary}
                      onChange={(event) => setBaseSalary(event.target.value)}
                      placeholder='0.00'
                    />
                  </div>
                </div>

                {/* Effective Date */}

                <div className='space-y-2'>
                  <Label>{ct('effectiveDate')}</Label>

                  <div className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'>
                    <span className='text-sm tabular-nums' dir='ltr'>
                      {startDate}
                    </span>

                    <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                      {ct('systemDefined')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allowances */}

              <div className='space-y-4 border-t pt-5'>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <h4 className='text-sm font-semibold'>
                      {et('allowancesLabel')}
                    </h4>

                    <p className='mt-1 text-xs text-muted-foreground'>
                      {ct('allowanceSub')}
                    </p>
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addAllowance}
                  >
                    {et('addAllowance')}
                  </Button>
                </div>

                <div className='space-y-3'>
                  {allowances.map((allowance, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 gap-3 rounded-xl border bg-muted/10 p-3 md:grid-cols-[minmax(0,1fr)_180px_40px] md:items-end'
                    >
                      <div className='space-y-2'>
                        <Label>{cmt('allowanceType')}</Label>

                        <AllowanceTypeCombobox
                          value={allowance.type}
                          options={getAvailableAllowanceTypes(index)}
                          onChange={(type) =>
                            updateAllowance(index, 'type', type)
                          }
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`allowance-amount-${index}`}>
                          {cmt('amount')}
                        </Label>

                        <div className='relative'>
                          <span className='pointer-events-none absolute inset-y-0 start-3 z-10 flex items-center text-muted-foreground'>
                            <SaudiRiyalSymbol
                              showAccessibleText={false}
                              className='text-base'
                            />
                          </span>

                          <Input
                            id={`allowance-amount-${index}`}
                            type='number'
                            min='0'
                            step='0.01'
                            inputMode='decimal'
                            className='h-11 ps-9'
                            // aria-label={`${ct('amount')} in Saudi Riyals`}
                            value={allowance.amount || ''}
                            onChange={(event) =>
                              updateAllowance(
                                index,
                                'amount',
                                event.target.value,
                              )
                            }
                            placeholder='0.00'
                          />
                        </div>
                      </div>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-10 text-muted-foreground hover:text-destructive'
                        onClick={() => removeAllowance(index)}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  ))}

                  {allowances.length === 0 && (
                    <div className='rounded-lg border border-dashed bg-muted/10 px-4 py-5 text-center text-sm text-muted-foreground'>
                      {et('noAllowanceMessage')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ------------------------------------------------ */}
        {/* Notes */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('renewalNotes')}
          description={ct('renewalNotesSub')}
          badge={common('optional')}
        >
          <div className='grid grid-cols-1 gap-5'>
            <div className='space-y-2'>
              <Label htmlFor='renewal-movement-remarks'>
                {et('movementRemarks')}
              </Label>

              <Textarea
                id='renewal-movement-remarks'
                value={remarks}
                disabled={isSubmitting}
                rows={3}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder={ct('renewalMovementRemarksPlaceholder')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='renewal-contract-notes'>
                {et('contractNotes')}
              </Label>

              <Textarea
                id='renewal-contract-notes'
                value={notes}
                disabled={isSubmitting}
                rows={3}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={ct('renewalContractNotesPlaceholder')}
              />
            </div>
          </div>
        </Section>
      </div>

      {/* ------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------ */}

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={ct('renewContract')}
        savingLabel={ct('renewingContract')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<RefreshCcw className='size-4' />}
      />

      {/* ------------------------------------------------ */}
      {/* No Compensation Change Confirmation */}
      {/* ------------------------------------------------ */}

      <AlertDialog
        open={confirmWithoutCompensationOpen}
        onOpenChange={(open) => {
          if (!isSubmitting && !isConfirmAnimating) {
            setConfirmWithoutCompensationOpen(open)
          }
        }}
      >
        <AlertDialogContent className='bg-transparent p-0 ring-0 data-open:animate-none data-closed:animate-none'>
          <div
            ref={setConfirmDialogRef}
            className='grid w-full gap-4 rounded-xl bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10'
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ct('renewWithoutCompensationTitle')}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {hasPromotion
                  ? ct('renewWithoutCompensationPromotionMessage')
                  : hasDemotion
                    ? ct('renewWithoutCompensationDemotionMessage')
                    : ct('renewWithoutCompensationMessage')}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting || isConfirmAnimating}>
                {common('cancel')}
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={isSubmitting || isConfirmAnimating}
                onClick={(event) => {
                  /*
                   * Do not allow Radix to close/unmount the
                   * dialog before GSAP finishes the exit.
                   */
                  event.preventDefault()

                  shootConfirmationAndSubmit()
                }}
              >
                {ct('continueRenewal')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export function ContractRenewalDialog(props: Props) {
  const ct = useTranslations('contracts')

  const dialogKey = props.open
    ? `renew-${props.currentContractId}`
    : 'closed-renewal'

  return (
    <FormDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={ct('renewContract')}
      description={ct('contractSub')}
      className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {props.open && (
        <ContractRenewalDialogContent key={dialogKey} {...props} />
      )}
    </FormDialog>
  )
}
