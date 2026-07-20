// src/components/dialogs/contract-renewal-dialog.tsx

'use client'

import { useState } from 'react'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/forms'
//import { PositionItemCombobox } from '@/modules/hr/position-items/components/position-item-combobox'
import type {
  RenewalMovementType,
  RenewContractPayload,
} from '@/modules/hr/contracts/types/contract-renewal.types'
import { PositionItemCombobox } from '@/modules/hr/positions-items/components/position-item-combobox'
import { useAllowanceOptions } from '@/modules/hr/compensations/utils/allowance-options'
import { DepartmentCombobox } from '@/modules/hr/departments/components/department-combobox'
import { PositionCombobox } from '@/modules/hr/positions/components/position-combobox'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { AllowanceTypeCombobox } from '../comboboxes/allowance-combobox'
import { useLocale, useTranslations } from 'next-intl'
import { Footer } from '../footer/footer'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void

  currentContractId: string
  currentPositionItemId: string
  currentItemNumber?: string | null
  currentDepartmentId?: string | null
  currentPositionId?: string | null
  currentDepartmentName?: string | null
  currentPositionTitle?: string | null

  currentBaseSalary?: number | string | null
  currentAllowances?: {
    type: string
    amount: number | string
  }[]

  defaultStartDate: string
  onSubmit: (payload: RenewContractPayload) => void | Promise<void>
}

function addMonthsMinusOneDay(startDate: string, months: number) {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + months)
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

function ContractRenewalDialogContent({
  onOpenChange,
  onSubmit,
  currentContractId,
  currentPositionItemId,
  currentItemNumber,
  currentDepartmentId,
  currentPositionId,
  defaultStartDate,
  currentBaseSalary,
  currentAllowances,
  currentDepartmentName,
  currentPositionTitle,
}: Props) {
  const ct = useTranslations('contracts')
  const et = useTranslations('employees')
  //const cmt = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [durationMonths, setDurationMonths] = useState<'3' | '6' | '12'>('12')
  const [endDate, setEndDate] = useState(
    addMonthsMinusOneDay(defaultStartDate, 12),
  )
  const [positionItemId, setPositionItemId] = useState(currentPositionItemId)
  const [selectedItemNumber, setSelectedItemNumber] =
    useState(currentItemNumber)
  const [actualDepartmentId, setActualDepartmentId] =
    useState(currentDepartmentId)
  const [actualPositionId, setActualPositionId] = useState(currentPositionId)
  const [movementType, setMovementType] =
    useState<RenewalMovementType>('renewal')
  const [baseSalary, setBaseSalary] = useState(
    currentBaseSalary ? String(currentBaseSalary) : '',
  )
  const [remarks, setRemarks] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const allowanceOptions = useAllowanceOptions()
  const formInvalid =
    !startDate || !endDate || !positionItemId || endDate < startDate

  function closeDialog() {
    if (isSubmitting) return

    onOpenChange(false)
  }
  const [allowances, setAllowances] = useState<
    { type: string; amount: number }[]
  >(
    currentAllowances?.map((allowance) => ({
      type: allowance.type,
      amount: Number(allowance.amount),
    })) ?? [],
  )

  function addAllowance() {
    setAllowances((prev) => [...prev, { type: '', amount: 0 }])
  }

  function updateAllowance(
    index: number,
    field: 'type' | 'amount',
    value: string,
  ) {
    setAllowances((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'amount' ? Number(value) : value,
            }
          : item,
      ),
    )
  }

  function removeAllowance(index: number) {
    setAllowances((prev) => prev.filter((_, i) => i !== index))
  }

  function getAvailableAllowanceTypes(currentIndex: number) {
    const selected = new Set(
      allowances
        .filter((_, index) => index !== currentIndex)
        .map((allowance) => allowance.type),
    )

    return allowanceOptions.filter((option) => !selected.has(option.value))
  }

  function updateStartDate(value: string) {
    setStartDate(value)
    setEndDate(addMonthsMinusOneDay(value, Number(durationMonths)))
  }

  function updateDuration(value: '3' | '6' | '12') {
    setDurationMonths(value)
    setEndDate(addMonthsMinusOneDay(startDate, Number(value)))
  }

  async function handleSubmit() {
    //if (isSubmitting) return
    //if (!startDate || !endDate || !positionItemId) return
    if (isSubmitting || formInvalid) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        currentContractId,
        contract: {
          startDate,
          endDate,
          signedDate: null,
          notes: notes || null,
        },
        movement: {
          positionItemId,
          movementType,
          remarks: remarks || null,
        },
        appointment: {
          actualDepartmentId: actualDepartmentId ?? null,
          actualPositionId: actualPositionId ?? null,
          appointmentType: 'primary',
          assignmentReason:
            movementType === 'promotion'
              ? 'promotion'
              : movementType === 'temporary_assignment'
                ? 'temporary_coverage'
                : 'service_need',
          remarks: remarks || null,
        },
        compensation:
          baseSalary || allowances.length
            ? {
                baseSalary: Number(baseSalary || 0),
                reason:
                  movementType === 'promotion'
                    ? 'Contract renewal with promotion'
                    : 'Contract renewal',
                allowances: allowances
                  .filter((allowance) => allowance.type)
                  .map((allowance) => ({
                    type: allowance.type,
                    amount: Number(allowance.amount),
                  })),
              }
            : undefined,
      })

      onOpenChange(false)
    } catch {
      // Keep the dialog open.
      // The parent mutation hook can display the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5'>
        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold'>{ct('contractPeriod')}</h3>
            <p className='text-xs text-muted-foreground'>
              {ct('contractSub2')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{ct('startDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={startDate}
                onChange={(e) => updateStartDate(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>{ct('duration')}</Label>
              <Select value={durationMonths} onValueChange={updateDuration}>
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent dir={isRtl ? 'rtl' : 'ltr'}>
                  <SelectItem value='3'>{ct('threeMonths')}</SelectItem>
                  <SelectItem value='6'>{ct('sixMonths')}</SelectItem>
                  <SelectItem value='12'>{ct('twelveMonths')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 lg:col-span-2'>
              <Label>{ct('endDate')}</Label>
              <Input
                type='date'
                className='h-11'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold'>{ct('officialMovement')}</h3>
            <p className='text-xs text-muted-foreground'>
              {ct('officialMovementSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{ct('movementType')}</Label>
              <Select
                value={movementType}
                onValueChange={(v) => setMovementType(v as RenewalMovementType)}
              >
                <SelectTrigger className='h-11 bg-background'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='renewal'>{ct('renewal')}</SelectItem>
                  <SelectItem value='promotion'>{ct('promotion')}</SelectItem>
                  <SelectItem value='transfer'>{ct('transfer')}</SelectItem>
                  <SelectItem value='demotion'>{ct('demotion')}</SelectItem>
                  <SelectItem value='temporary_assignment'>
                    {ct('temporary_assignment')}
                  </SelectItem>
                  <SelectItem value='acting'>{ct('acting')}</SelectItem>
                  <SelectItem value='amendment'>{ct('amendment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 lg:col-span-2'>
              <Label>{et('pcnText')}</Label>
              <PositionItemCombobox
                value={positionItemId}
                selectedLabel={selectedItemNumber}
                onChange={(item) => {
                  setPositionItemId(item.id)
                  setSelectedItemNumber(item.itemNumber)
                  setActualDepartmentId(item.departmentId)
                  setActualPositionId(item.positionId)
                }}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 lg:col-span-2 lg:grid-cols-2'>
              <div className='space-y-2'>
                <Label>{ct('actualDepartmentLabel')}</Label>
                <DepartmentCombobox
                  value={actualDepartmentId ?? null}
                  selectedLabel={currentDepartmentName}
                  onChange={(department) => {
                    setActualDepartmentId(department.id)
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label>{ct('actualPositionLabel')}</Label>
                <PositionCombobox
                  value={actualPositionId ?? null}
                  selectedLabel={currentPositionTitle}
                  onChange={(position) => {
                    setActualPositionId(position.id)
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-card p-5 shadow-sm'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold'>{et('compensation')}</h3>
            <p className='text-xs text-muted-foreground'>
              {ct('compensationSub')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>{et('baseSalaryLabel')}</Label>
              <Input
                type='number'
                className='h-11'
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                placeholder='9500'
              />
            </div>
          </div>

          <div className='space-y-4 pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-sm font-semibold'>
                  {et('allowancesLabel')}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {ct('allowanceSub')}
                </p>
              </div>

              <Button type='button' variant='outline' onClick={addAllowance}>
                {et('addAllowance')}
              </Button>
            </div>

            <div className='space-y-3'>
              {allowances.map((allowance, index) => (
                <div
                  key={index}
                  className='grid grid-cols-1 gap-3 rounded-xl border bg-background p-3 md:grid-cols-[1fr_160px_40px] md:items-end'
                >
                  <div className='space-y-2'>
                    <Label className='md:hidden'>Allowance Type</Label>
                    <AllowanceTypeCombobox
                      value={allowance.type}
                      options={getAvailableAllowanceTypes(index)}
                      onChange={(selectedType) =>
                        updateAllowance(index, 'type', selectedType)
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='md:hidden'>Amount</Label>
                    <Input
                      type='number'
                      value={allowance.amount}
                      onChange={(e) =>
                        updateAllowance(index, 'amount', e.target.value)
                      }
                      placeholder='0'
                    />
                  </div>

                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='justify-self-end md:justify-self-auto'
                    onClick={() => removeAllowance(index)}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              ))}

              {allowances.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  {et('noAllowanceMessage')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className='rounded-2xl border bg-muted/30 p-5 shadow-sm'>
          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <Label>{et('movementRemarks')}</Label>
              <Textarea
                value={remarks}
                disabled={isSubmitting}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder='Renewed with same PCN, promotion, transfer, etc.'
              />
            </div>

            <div className='space-y-2'>
              <Label>{et('contractNotes')}</Label>
              <Textarea
                value={notes}
                disabled={isSubmitting}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Optional contract notes.'
              />
            </div>
          </div>
        </section>
      </div>

      {/* <DialogFooter className='shrink-0 border-t bg-muted/40 px-4 py-4 sm:px-6 sm:py-6'>
        <Button
          type='button'
          variant='outline'
          onClick={() => onOpenChange(false)}
        >
          {cmt('cancel')}
        </Button>

        <Button
          type='button'
          className='bg-slate-950 text-white hover:bg-slate-800'
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? ct('renewingContract') : ct('renewContract')}
        </Button>
      </DialogFooter> */}
      <Footer
        onCancel={closeDialog}
        onSave={handleSubmit}
        label={ct('renewContract')}
        savingLabel={ct('renewingContract')}
        disabled={formInvalid}
        isSaving={isSubmitting}
        saveVariant='default'
        saveIcon={<RefreshCcw className='h-4 w-4' />}
      />
    </>
  )
}

export function ContractRenewalDialog(props: Props) {
  const dialogKey = props.open
    ? `renew-${props.currentContractId}`
    : 'closed-renewal'
  const ct = useTranslations('contracts')

  return (
    // <FormDialog
    //   open={props.open}
    //   onOpenChange={props.onOpenChange}
    //   title={ct('renewContract')}
    //   description={ct('contractSub')}
    //   className='flex max-h-[calc(100dvh-2rem)] min-h-0 w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 md:w-[80vw] md:max-w-4xl lg:w-[70vw] lg:max-w-5xl'
    //   headerClassName='shrink-0 border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white'
    // >
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
