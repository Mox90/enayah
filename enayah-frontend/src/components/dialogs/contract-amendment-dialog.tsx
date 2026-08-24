// enayah-frontend/src/components/dialogs/contract-amendment-dialog.tsx

'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { FilePenLine, Trash2, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'

import { useAllowanceOptions } from '@/modules/hr/compensations/utils/allowance-options'
import type {
  ApplyContractMovementPayload,
  ContractMovementActionType,
} from '@/modules/hr/contracts/types/contract-movement.types'
import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import type { StaffCategory } from '@/modules/hr/employments/types/employment.types'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'
import { PositionCombobox } from '@/modules/hr/positions/components/position-combobox'

import { Footer } from '../footer/footer'
import { DatePicker } from './date-picker'

type AllowanceValue = {
  type: string
  amount: number | string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentContractId: string
  staffCategory: StaffCategory
  contractStartDate: string
  contractEndDate: string
  currentMovementStartDate: string
  currentMovementEndDate?: string | null
  currentPositionItemId?: string | null
  currentItemNumber?: string | null
  currentDepartmentId?: string | null
  currentPositionId?: string | null
  currentDepartmentName?: string | null
  currentPositionTitle?: string | null
  currentBaseSalary?: number | string | null
  currentAllowances?: AllowanceValue[]
  onSubmit: (payload: ApplyContractMovementPayload) => void | Promise<void>
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

function ContractAmendmentDialogContent({
  onOpenChange,
  onSubmit,

  currentContractId,
  staffCategory,

  contractStartDate,
  contractEndDate,

  currentMovementStartDate,
  currentMovementEndDate,

  currentPositionItemId,
  currentItemNumber,

  currentDepartmentId,
  currentPositionId,

  currentDepartmentName,
  currentPositionTitle,

  currentBaseSalary,
  currentAllowances = [],
}: Props) {
  const ct = useTranslations('contracts')
  const et = useTranslations('employees')
  const common = useTranslations('common')
  const at = useTranslations('allowanceTypes')
  const cmt = useTranslations('compensations')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const allowanceOptions = useAllowanceOptions()
  const isMilitary = staffCategory === 'military'
  const requiresPositionItem =
    staffCategory === 'civilian' || staffCategory === 'contractual'

  // --------------------------------------------------------------------------
  // Effective Date
  // --------------------------------------------------------------------------

  const [effectiveDate, setEffectiveDate] = useState<string | null>(null)

  // --------------------------------------------------------------------------
  // Movement Actions
  // --------------------------------------------------------------------------

  const [actions, setActions] = useState<ContractMovementActionType[]>([])
  const hasPromotion = actions.includes('promotion')
  const hasDemotion = actions.includes('demotion')
  const hasTransfer = actions.includes('transfer')
  const hasPcnAlignment = actions.includes('pcn_alignment')

  // --------------------------------------------------------------------------
  // Promotion / Demotion
  // --------------------------------------------------------------------------

  const [newPositionId, setNewPositionId] = useState<string | null>(null)
  const [newPositionTitle, setNewPositionTitle] = useState<string | null>(null)

  // --------------------------------------------------------------------------
  // Transfer
  // --------------------------------------------------------------------------

  const [newDepartmentId, setNewDepartmentId] = useState<string | null>(null)
  const [newDepartmentName, setNewDepartmentName] = useState<string | null>(
    null,
  )

  // --------------------------------------------------------------------------
  // PCN Alignment
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
  // Military PCN
  // --------------------------------------------------------------------------

  /*
   * Military employees may explicitly end
   * the amendment without a PCN.
   *
   * Civilian / contractual employees cannot.
   */
  const [removeCurrentPcn, setRemoveCurrentPcn] = useState(false)

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
  // Submission
  // --------------------------------------------------------------------------

  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmWithoutCompensationOpen, setConfirmWithoutCompensationOpen] =
    useState(false)

  // --------------------------------------------------------------------------
  // Resulting Legal Assignment
  // --------------------------------------------------------------------------

  /*
   * PCN Alignment:
   *
   * selected PCN becomes authoritative
   * for:
   *
   * PCN
   * legal department
   * legal position
   *
   * Otherwise:
   *
   * promotion / demotion may retain PCN
   * transfer may retain PCN
   */
  const finalPositionItemId = hasPcnAlignment
    ? alignedPositionItemId
    : removeCurrentPcn
      ? null
      : (currentPositionItemId ?? null)
  const finalItemNumber = hasPcnAlignment
    ? alignedItemNumber
    : removeCurrentPcn
      ? null
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
  // Determine Actual Changes
  // --------------------------------------------------------------------------

  const positionItemChanged =
    finalPositionItemId !== (currentPositionItemId ?? null)
  const departmentChanged = finalDepartmentId !== (currentDepartmentId ?? null)
  const positionChanged = finalPositionId !== (currentPositionId ?? null)

  // --------------------------------------------------------------------------
  // Compensation Comparison
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

  const compensationChanged =
    compensationEnabled &&
    currentCompensationSnapshot !== draftCompensationSnapshot

  // --------------------------------------------------------------------------
  // Date Validation
  // --------------------------------------------------------------------------

  let dateValidationMessage: string | null = null

  if (!effectiveDate) {
    dateValidationMessage = ct('amendmentEffectiveDateRequired')
  } else if (effectiveDate <= currentMovementStartDate) {
    dateValidationMessage = ct('amendmentEffectiveDateAfterMovementStart')
  } else if (effectiveDate > contractEndDate) {
    dateValidationMessage = ct('amendmentEffectiveDateAfterContractEnd')
  } else if (currentMovementEndDate && effectiveDate > currentMovementEndDate) {
    dateValidationMessage = ct('amendmentEffectiveDateAfterMovementEnd')
  }

  // --------------------------------------------------------------------------
  // Action Validation
  // --------------------------------------------------------------------------

  let actionValidationMessage: string | null = null

  if (actions.length === 0) {
    actionValidationMessage = ct('amendmentActionRequired')
  } else if (hasPcnAlignment && !alignedPositionItemId) {
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
  } else if (!positionItemChanged && !departmentChanged && !positionChanged) {
    actionValidationMessage = ct('amendmentNoChange')
  }

  /*
   * General PCN rule.
   *
   * This is intentionally separate from
   * promotion / demotion / transfer validation.
   */
  const positionItemInvalid = requiresPositionItem && !finalPositionItemId
  const compensationInvalid =
    compensationEnabled &&
    (baseSalary.trim() === '' ||
      Number(baseSalary) <= 0 ||
      allowances.some(
        (allowance) => !allowance.type.trim() || Number(allowance.amount) <= 0,
      ))
  const formInvalid =
    Boolean(dateValidationMessage) ||
    !finalDepartmentId ||
    !finalPositionId ||
    positionItemInvalid ||
    Boolean(actionValidationMessage) ||
    compensationInvalid

  // --------------------------------------------------------------------------
  // Action Helpers
  // --------------------------------------------------------------------------

  function toggleAction(action: ContractMovementActionType) {
    setActions((current) => {
      if (current.includes(action)) {
        return current.filter((item) => item !== action)
      }

      /*
       * Promotion and demotion are
       * mutually exclusive.
       */
      if (action === 'promotion') {
        return [...current.filter((item) => item !== 'demotion'), 'promotion']
      }

      if (action === 'demotion') {
        return [...current.filter((item) => item !== 'promotion'), 'demotion']
      }

      return [...current, action]
    })

    /*
     * Cannot align to a PCN while
     * simultaneously removing the PCN.
     */
    if (action === 'pcn_alignment') {
      setRemoveCurrentPcn(false)
    }
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
  // Display Helpers
  // --------------------------------------------------------------------------

  function formatMoney(amount: number | string | null | undefined) {
    if (amount === null || amount === undefined || amount === '') {
      return '—'
    }

    return (
      <span
        className='inline-flex items-baseline gap-1.5 tabular-nums'
        dir='ltr'
      >
        <SaudiRiyalSymbol className='text-[0.95em]' />

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
    if (hasPromotion && hasTransfer) {
      return 'Promotion and transfer'
    }

    if (hasDemotion && hasTransfer) {
      return 'Demotion and transfer'
    }

    if (hasPromotion) {
      return 'Promotion'
    }

    if (hasDemotion) {
      return 'Demotion'
    }

    if (hasTransfer) {
      return 'Transfer'
    }

    if (hasPcnAlignment) {
      return 'PCN alignment'
    }

    return 'Contract amendment'
  }

  // --------------------------------------------------------------------------
  // Payload
  // --------------------------------------------------------------------------

  function buildPayload(): ApplyContractMovementPayload {
    if (!effectiveDate) {
      throw new Error('Movement effective date is required')
    }

    return {
      currentContractId,
      effectiveDate,
      movement: {
        /*
         * Send resulting PCN explicitly.
         *
         * Military can therefore send null
         * intentionally.
         */
        positionItemId: finalPositionItemId,
        officialDepartmentId: finalDepartmentId,
        officialPositionId: finalPositionId,
        actions,
        remarks: remarks.trim() || null,
      },
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
    }
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------

  async function submitAmendment() {
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
       *
       * Mutation hook handles
       * backend error toast.
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
     * Promotion / demotion may legitimately
     * keep existing compensation.
     *
     * Require conscious confirmation rather
     * than making compensation mandatory.
     */
    if ((hasPromotion || hasDemotion) && !compensationChanged) {
      setConfirmWithoutCompensationOpen(true)

      return
    }

    await submitAmendment()
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
        {/* Current Contract */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('currentContractPeriod')}
          description={ct('amendmentContractPeriodSub')}
          badge={ct('current')}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <ReadOnlyField label={ct('startDate')} value={contractStartDate} />

            <ReadOnlyField label={ct('endDate')} value={contractEndDate} />

            <ReadOnlyField
              label={ct('movementType')}
              value={
                <span className='flex items-center justify-between gap-2'>
                  <span>{ct('amendment')}</span>

                  <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                    {ct('systemDefined')}
                  </span>
                </span>
              }
            />
          </div>
        </Section>

        {/* ------------------------------------------------ */}
        {/* Effective Date */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('amendmentEffectiveDate')}
          description={ct('amendmentEffectiveDateSub')}
        >
          <div className='space-y-2'>
            <Label htmlFor='amendment-effective-date'>
              {ct('effectiveDate')}

              <span className='ms-1 text-destructive'>*</span>
            </Label>

            <DatePicker
              id='amendment-effective-date'
              value={effectiveDate}
              onChange={setEffectiveDate}
            />

            {dateValidationMessage && (
              <p className='text-xs font-medium text-destructive'>
                {dateValidationMessage}
              </p>
            )}

            <p className='text-xs text-muted-foreground'>
              {ct('currentMovementPeriod', {
                start: currentMovementStartDate,

                end: currentMovementEndDate ?? contractEndDate,
              })}
            </p>
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

          {isMilitary && currentPositionItemId && !hasPcnAlignment && (
            <label
              htmlFor='amendment-remove-current-pcn'
              className='mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-dashed bg-muted/10 p-4'
            >
              <Checkbox
                id='amendment-remove-current-pcn'
                checked={removeCurrentPcn}
                disabled={isSubmitting}
                onCheckedChange={(checked) =>
                  setRemoveCurrentPcn(checked === true)
                }
                className='mt-0.5'
              />

              <span className='min-w-0'>
                <span className='block text-sm font-medium'>
                  {ct('removeMilitaryPcn')}
                </span>

                <span className='mt-1 block text-xs leading-relaxed text-muted-foreground'>
                  {ct('removeMilitaryPcnSub')}
                </span>
              </span>
            </label>
          )}
        </Section>

        {/* ------------------------------------------------ */}
        {/* Amendment Actions */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('amendmentActions')}
          description={ct('amendmentActionsSub')}
          badge={actions.length > 0 ? String(actions.length) : undefined}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <ActionOption
              id='amendment-action-promotion'
              label={ct('promotion')}
              description={ct('promotionActionSub')}
              checked={hasPromotion}
              disabled={hasDemotion || isSubmitting}
              onToggle={() => toggleAction('promotion')}
            />

            <ActionOption
              id='amendment-action-demotion'
              label={ct('demotion')}
              description={ct('demotionActionSub')}
              checked={hasDemotion}
              disabled={hasPromotion || isSubmitting}
              onToggle={() => toggleAction('demotion')}
            />

            <ActionOption
              id='amendment-action-transfer'
              label={ct('transfer')}
              description={ct('transferActionSub')}
              checked={hasTransfer}
              disabled={isSubmitting}
              onToggle={() => toggleAction('transfer')}
            />

            <ActionOption
              id='amendment-action-pcn-alignment'
              label={ct('pcn_alignment')}
              description={ct('pcnAlignmentActionSub')}
              checked={hasPcnAlignment}
              disabled={isSubmitting}
              onToggle={() => toggleAction('pcn_alignment')}
            />
          </div>

          {actions.length === 0 && (
            <p className='mt-3 text-xs font-medium text-destructive'>
              {ct('amendmentActionRequired')}
            </p>
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
            description={ct('amendmentResultingAssignmentSub')}
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
                value={
                  finalItemNumber ??
                  finalPositionItemId ??
                  (isMilitary ? ct('noPcnAssignedMilitary') : '—')
                }
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
          description={ct('amendmentCompensationSub')}
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
                <div className='space-y-2'>
                  <Label htmlFor='amendment-base-salary'>
                    {et('baseSalaryLabel')}

                    <span className='ms-1 text-destructive'>*</span>
                  </Label>

                  <div className='relative'>
                    <span className='pointer-events-none absolute inset-y-0 start-3 z-10 flex items-center text-muted-foreground'>
                      <SaudiRiyalSymbol className='text-base' />
                    </span>

                    <Input
                      id='amendment-base-salary'
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

                <div className='space-y-2'>
                  <Label>{ct('effectiveDate')}</Label>

                  <div className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'>
                    <span className='text-sm tabular-nums' dir='ltr'>
                      {effectiveDate ?? '—'}
                    </span>

                    <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                      {ct('systemDefined')}
                    </span>
                  </div>
                </div>
              </div>

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
                        <Label>{cmt('amount')}</Label>

                        <div className='relative'>
                          <span className='pointer-events-none absolute inset-y-0 start-3 z-10 flex items-center text-muted-foreground'>
                            <SaudiRiyalSymbol className='text-base' />
                          </span>

                          <Input
                            type='number'
                            min='0'
                            step='0.01'
                            inputMode='decimal'
                            className='h-11 ps-9'
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
        {/* Remarks */}
        {/* ------------------------------------------------ */}

        <Section
          title={ct('amendmentNotes')}
          description={ct('amendmentNotesSub')}
          badge={common('optional')}
        >
          <div className='space-y-2'>
            <Label htmlFor='amendment-movement-remarks'>
              {et('movementRemarks')}
            </Label>

            <Textarea
              id='amendment-movement-remarks'
              value={remarks}
              disabled={isSubmitting}
              rows={3}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder={ct('amendmentMovementRemarksPlaceholder')}
            />
          </div>
        </Section>
      </div>

      {/* ------------------------------------------------ */}
      {/* Footer */}
      {/* ------------------------------------------------ */}

      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={ct('amendContract')}
        savingLabel={ct('amendingContract')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<FilePenLine className='size-4' />}
      />

      {/* ------------------------------------------------ */}
      {/* Promotion / Demotion Without Compensation */}
      {/* ------------------------------------------------ */}

      <AlertDialog
        open={confirmWithoutCompensationOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setConfirmWithoutCompensationOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {ct('amendWithoutCompensationTitle')}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {hasPromotion
                ? ct('amendWithoutCompensationPromotionMessage')
                : ct('amendWithoutCompensationDemotionMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {common('cancel')}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault()

                setConfirmWithoutCompensationOpen(false)

                void submitAmendment()
              }}
            >
              {ct('continueAmendment')}
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

export function ContractAmendmentDialog(props: Props) {
  const ct = useTranslations('contracts')

  const dialogKey = props.open
    ? `amend-${props.currentContractId}`
    : 'closed-amendment'

  return (
    <FormDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={ct('amendContract')}
      description={ct('amendContractSub')}
      className='flex h-[calc(100dvh-1rem)] min-h-0 w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
      headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    >
      {props.open && (
        <ContractAmendmentDialogContent key={dialogKey} {...props} />
      )}
    </FormDialog>
  )
}
