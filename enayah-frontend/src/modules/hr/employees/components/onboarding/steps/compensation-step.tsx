// enayah-frontend/src/modules/hr/employees/components/onboarding/steps/compensation-step.tsx

'use client'

import { AllowanceTypeCombobox } from '@/components/comboboxes/allowance-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAllowanceOptions } from '@/modules/hr/compensations/utils/allowance-options'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { OnboardingFormSection } from '../sections/onboarding-form-section'
import { CompensationErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { SaudiRiyalSymbol } from '@/components/icons/saudi-riyal-symbol'
import { FloatingField } from '@/components/forms/floating-field'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  errors: CompensationErrors
  onClearError: (field: keyof CompensationErrors) => void
  onUpdateErrors: (
    updater: (previous: CompensationErrors) => CompensationErrors,
  ) => void
}

type CompensationInput = NonNullable<HireEmployeePayload['compensation']>

export function CompensationStep({
  value,
  onChange,
  errors,
  onClearError,
  onUpdateErrors,
}: Props) {
  const t = useTranslations('compensations')
  const ct = useTranslations('common')
  const locale = useLocale()
  const allowanceOptions = useAllowanceOptions()
  const compensation = value.compensation
  const allowances = value.allowances ?? []
  const totalAllowances = allowances.reduce(
    (total, allowance) => total + Number(allowance.amount || 0.0),
    0,
  )
  const baseSalary = Number(compensation?.baseSalary || 0.0)
  const totalMonthlyCompensation = baseSalary + totalAllowances

  // function stepBaseSalary(direction: 1 | -1) {
  //   const current = Number(compensation?.baseSalary ?? 0)
  //   const next = Math.max(0, Number((current + direction * 1).toFixed(2)))

  //   updateCompensation('baseSalary', next)
  // }
  // function stepBaseSalary(direction: 1 | -1) {
  //   if (!compensation) {
  //     return
  //   }

  //   const current = Number(compensation.baseSalary ?? 0)

  //   // Work in cents to avoid floating-point precision issues.
  //   const currentInCents = Math.round(current * 100)
  //   const nextInCents = Math.max(0, currentInCents + direction)

  //   updateCompensation('baseSalary', nextInCents / 100)
  // }
  function stepBaseSalary(direction: 1 | -1) {
    if (!compensation) {
      return
    }

    const current = Number(compensation.baseSalary ?? 0)
    const next = Math.max(0, current + direction)

    updateCompensation('baseSalary', next)
  }

  function enableCompensation() {
    onClearError('baseSalary')
    onClearError('effectiveDate')
    onChange({
      ...value,
      compensation: {
        effectiveDate: value.contract.startDate,
        baseSalary: 0.0,
        status: 'approved',
        reason: 'Initial hire',
      },
    })
  }

  function removeCompensation() {
    onClearError('baseSalary')
    onClearError('effectiveDate')
    onClearError('allowanceTypes')
    onClearError('allowanceAmounts')
    onChange({
      ...value,
      compensation: undefined,
      allowances: [],
    })
  }

  function updateCompensation<K extends keyof CompensationInput>(
    field: K,
    fieldValue: CompensationInput[K],
  ) {
    if (!compensation) {
      return
    }

    if (field === 'baseSalary') {
      onClearError('baseSalary')
    }

    if (field === 'effectiveDate') {
      onClearError('effectiveDate')
    }

    onChange({
      ...value,
      compensation: {
        ...compensation,
        [field]: fieldValue,
      },
    })
  }

  function addAllowance() {
    if (!compensation) {
      return
    }

    onChange({
      ...value,
      allowances: [
        ...allowances,
        {
          type: '',
          amount: 0.0,
        },
      ],
    })
  }

  function clearAllowanceError(
    field: 'allowanceTypes' | 'allowanceAmounts',
    index: number,
  ) {
    onUpdateErrors((previous) => {
      const current = previous[field]

      if (!current?.[index]) {
        return previous
      }

      const nextIndexedErrors = {
        ...current,
      }

      delete nextIndexedErrors[index]

      const next = {
        ...previous,
      }

      if (Object.keys(nextIndexedErrors).length === 0) {
        delete next[field]
      } else {
        next[field] = nextIndexedErrors
      }

      return next
    })
  }

  function updateAllowance(
    index: number,
    field: 'type' | 'amount',
    fieldValue: string,
  ) {
    const nextAllowances = [...allowances]
    const current = nextAllowances[index]

    if (!current) {
      return
    }

    if (field === 'type') {
      clearAllowanceError('allowanceTypes', index)
    }

    if (field === 'amount') {
      clearAllowanceError('allowanceAmounts', index)
    }

    nextAllowances[index] = {
      ...current,

      [field]: field === 'amount' ? Number(fieldValue) : fieldValue,
    }

    onChange({
      ...value,
      allowances: nextAllowances,
    })
  }

  function removeAllowance(index: number) {
    const nextAllowances = allowances.filter(
      (_, allowanceIndex) => allowanceIndex !== index,
    )

    /*
     * Removing an array row shifts
     * subsequent indexes, so the
     * simplest safe behavior is to
     * clear indexed allowance errors.
     *
     * The next validation pass will
     * recreate any remaining errors.
     */
    onClearError('allowanceTypes')
    onClearError('allowanceAmounts')
    onChange({
      ...value,
      allowances: nextAllowances,
    })
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

  // function stepAllowanceAmount(index: number, direction: 1 | -1) {
  //   const allowance = allowances[index]
  //   if (!allowance) {
  //     return
  //   }

  //   const current = Number(allowance.amount ?? 0)
  //   const next = Math.max(0, Number((current + direction * 0.01).toFixed(2)))
  //   updateAllowance(index, 'amount', String(next))
  // }
  function stepAllowanceAmount(index: number, direction: 1 | -1) {
    const allowance = allowances[index]

    if (!allowance) {
      return
    }

    const current = Number(allowance.amount ?? 0)
    const next = Math.max(0, current + direction)

    updateAllowance(index, 'amount', String(next))
  }

  if (!compensation) {
    return (
      <OnboardingFormSection
        title={t('compensationInformation')}
        description={t('compensationInformationSub')}
        badge={ct('optional')}
      >
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 px-6 py-10 text-center'>
          <div className='flex size-11 items-center justify-center rounded-full border bg-background shadow-sm'>
            <Plus className='size-5 text-muted-foreground' />
          </div>

          <h4 className='mt-4 text-sm font-semibold'>{t('noCompensation')}</h4>

          <p className='mt-1 max-w-md text-xs leading-relaxed text-muted-foreground'>
            {t('noCompensationSub')}
          </p>

          <Button
            type='button'
            variant='outline'
            className='mt-5'
            onClick={enableCompensation}
          >
            <Plus className='me-2 size-4' />

            {t('addCompensation')}
          </Button>
        </div>
      </OnboardingFormSection>
    )
  }

  return (
    <div className='space-y-5'>
      <OnboardingFormSection
        title={t('compensationInformation')}
        description={t('compensationInformationSub')}
        badge={ct('optional')}
      >
        <div className='space-y-5'>
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-muted-foreground hover:text-destructive'
              onClick={removeCompensation}
            >
              <X className='me-2 size-4' />

              {t('removeCompensation')}
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2'>
            {/* Base Salary */}

            <div className='space-y-2'>
              <FloatingField
                id='base-salary'
                label={t('baseSalary')}
                filled={
                  compensation.baseSalary !== null &&
                  compensation.baseSalary !== undefined
                }
                invalid={Boolean(errors.baseSalary)}
                required
              >
                <div className='relative' dir='ltr'>
                  <span
                    className='pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-base font-medium text-muted-foreground'
                    aria-hidden='true'
                  >
                    <SaudiRiyalSymbol
                      showAccessibleText={false}
                      className='text-base'
                    />
                  </span>

                  <Input
                    id='base-salary'
                    data-money-input='true'
                    type='number'
                    min='0'
                    step='0.01'
                    inputMode='decimal'
                    dir='ltr'
                    required
                    className='ps-10 pe-12 text-left'
                    value={compensation.baseSalary ?? ''}
                    aria-invalid={Boolean(errors.baseSalary)}
                    aria-describedby={
                      errors.baseSalary ? 'base-salary-error' : undefined
                    }
                    onChange={(event) =>
                      updateCompensation(
                        'baseSalary',
                        Number(event.target.value),
                      )
                    }
                  />

                  {/* <div className='absolute inset-y-0 right-2 flex flex-col justify-center gap-1'>
                    <button
                      type='button'
                      tabIndex={-1}
                      aria-label='Increase base salary'
                      className='flex h-4 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600'
                      onClick={() => stepBaseSalary(1)}
                    >
                      <ChevronUp className='size-3' />
                    </button>

                    <button
                      type='button'
                      tabIndex={-1}
                      aria-label='Decrease base salary'
                      className='flex h-4 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600'
                      onClick={() => stepBaseSalary(-1)}
                    >
                      <ChevronDown className='size-3' />
                    </button>
                  </div> */}
                  <div className='absolute right-2 top-1/2 flex h-7 w-6 -translate-y-1/2 flex-col overflow-hidden rounded-md'>
                    <button
                      type='button'
                      aria-label={t('increaseAmount')}
                      onClick={() => stepBaseSalary(1)}
                      className='flex flex-1 items-center justify-center rounded-t-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                    >
                      <ChevronUp className='size-3.5' />
                    </button>

                    <div className='mx-1 border-t border-border/40' />

                    <button
                      type='button'
                      aria-label={t('decreaseAmount')}
                      onClick={() => stepBaseSalary(-1)}
                      className='flex flex-1 items-center justify-center rounded-b-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                    >
                      <ChevronDown className='size-3.5' />
                    </button>
                  </div>
                </div>
              </FloatingField>

              {errors.baseSalary && (
                <p
                  id='base-salary-error'
                  className='text-xs font-medium text-destructive'
                >
                  {errors.baseSalary}
                </p>
              )}
            </div>

            {/* Effective Date */}

            {/* <div className='space-y-2'>
              <Label>{t('effectiveDate')}</Label>

              <div
                className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'
                aria-invalid={Boolean(errors.effectiveDate)}
              >
                <span className='text-sm tabular-nums' dir='ltr'>
                  {value.contract.startDate ?? '—'}
                </span>

                <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                  {t('systemDefined')}
                </span>
              </div>

              {errors.effectiveDate ? (
                <p className='text-xs font-medium text-destructive'>
                  {errors.effectiveDate}
                </p>
              ) : (
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {t('compensationEffectiveDateHint')}
                </p>
              )}
            </div> */}
            {/* Effective Date */}
            <div className='space-y-2'>
              <div
                data-slot='floating-field'
                data-filled='true'
                data-invalid={errors.effectiveDate ? 'true' : 'false'}
                className='relative'
              >
                <div
                  className='flex h-12 items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-3'
                  aria-invalid={Boolean(errors.effectiveDate)}
                >
                  <span className='text-sm tabular-nums' dir='ltr'>
                    {value.contract.startDate ?? '—'}
                  </span>

                  <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                    {t('systemDefined')}
                  </span>
                </div>

                <span data-slot='floating-label'>{t('effectiveDate')}</span>
              </div>

              {errors.effectiveDate ? (
                <p className='text-xs font-medium text-destructive'>
                  {errors.effectiveDate}
                </p>
              ) : (
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {t('compensationEffectiveDateHint')}
                </p>
              )}
            </div>

            {/* Status */}

            {/* <div className='space-y-2'>
              <Label>{ct('status')}</Label>

              <div className='flex h-11 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3'>
                <span className='text-sm font-medium'>{t('approved')}</span>

                <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                  {t('systemDefined')}
                </span>
              </div>
            </div> */}

            <div className='space-y-2'>
              <div
                data-slot='floating-field'
                data-filled='true'
                className='relative'
              >
                <div className='flex h-12 items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-3'>
                  <span className='text-sm font-medium'>{t('approved')}</span>

                  <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
                    {t('systemDefined')}
                  </span>
                </div>

                <span data-slot='floating-label'>{ct('status')}</span>
              </div>
            </div>

            {/* Reason */}

            <div className='space-y-2'>
              {/* <Label htmlFor='compensation-reason'>{t('reason')}</Label>

              <Input
                id='compensation-reason'
                className='h-11'
                value={compensation.reason ?? ''}
                onChange={(event) =>
                  updateCompensation('reason', event.target.value)
                }
                placeholder={t('reasonPlaceholder')}
              /> */}

              <FloatingField
                id='compensation-reason'
                label={t('reason')}
                filled={Boolean(compensation.reason)}
              >
                <Input
                  id='compensation-reason'
                  //dir='rtl'
                  value={compensation.reason ?? ''}
                  onChange={(event) =>
                    updateCompensation('reason', event.target.value)
                  }
                />
              </FloatingField>
            </div>
          </div>
        </div>
      </OnboardingFormSection>

      <OnboardingFormSection
        title={t('allowances')}
        description={t('allowancesSub')}
        badge={
          allowances.length > 0 ? String(allowances.length) : ct('optional')
        }
      >
        <div className='space-y-4'>
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addAllowance}
            >
              <Plus className='me-2 size-4' />

              {t('addAllowance')}
            </Button>
          </div>

          {allowances.length === 0 ? (
            <div className='rounded-lg border border-dashed bg-muted/10 px-4 py-6 text-center'>
              <p className='text-sm font-medium'>{t('noAllowances')}</p>

              <p className='mt-1 text-xs text-muted-foreground'>
                {t('noAllowancesSub')}
              </p>
            </div>
          ) : (
            // <div className='space-y-3'>
            //   {allowances.map((allowance, index) => {
            //     const typeError = errors.allowanceTypes?.[index]

            //     const amountError = errors.allowanceAmounts?.[index]

            //     return (
            //       <div
            //         key={index}
            //         className='grid grid-cols-1 gap-3 rounded-lg border bg-muted/10 p-3 sm:grid-cols-[minmax(0,1fr)_180px_40px] sm:items-end'
            //       >
            //         <div className='space-y-2'>
            //           <Label>
            //             {t('allowanceType')}

            //             <span className='ms-1 text-destructive'>*</span>
            //           </Label>

            //           <AllowanceTypeCombobox
            //             value={allowance.type}
            //             options={getAvailableAllowanceTypes(index)}
            //             onChange={(selectedType) =>
            //               updateAllowance(index, 'type', selectedType)
            //             }
            //           />

            //           {typeError && (
            //             <p className='text-xs font-medium text-destructive'>
            //               {typeError}
            //             </p>
            //           )}
            //         </div>

            //         <div className='space-y-2'>
            //           <Label htmlFor={`allowance-amount-${index}`}>
            //             {t('amount')}
            //             <span className='ms-1 text-destructive'>*</span>
            //           </Label>

            //           <div className='relative'>
            //             <span className='pointer-events-none absolute inset-y-0 start-3 z-10 flex items-center text-base font-medium text-muted-foreground'>
            //               <SaudiRiyalSymbol
            //                 showAccessibleText={false}
            //                 className='text-base'
            //               />
            //             </span>

            //             <Input
            //               id={`allowance-amount-${index}`}
            //               type='number'
            //               min='0'
            //               step='0.01'
            //               inputMode='decimal'
            //               className='h-11 ps-9'
            //               value={allowance.amount || ''}
            //               aria-invalid={Boolean(amountError)}
            //               onChange={(event) =>
            //                 updateAllowance(index, 'amount', event.target.value)
            //               }
            //               placeholder='0.00'
            //             />
            //           </div>

            //           {amountError && (
            //             <p className='text-xs font-medium text-destructive'>
            //               {amountError}
            //             </p>
            //           )}
            //         </div>

            //         <Button
            //           type='button'
            //           variant='ghost'
            //           size='icon'
            //           className='size-10 text-muted-foreground hover:text-destructive'
            //           aria-label={t('removeAllowance')}
            //           onClick={() => removeAllowance(index)}
            //         >
            //           <Trash2 className='size-4' />
            //         </Button>
            //       </div>
            //     )
            //   })}
            // </div>
            <div className='space-y-3'>
              {allowances.map((allowance, index) => {
                const typeError = errors.allowanceTypes?.[index]
                const amountError = errors.allowanceAmounts?.[index]

                const typeId = `allowance-type-${index}`
                const typeErrorId = `allowance-type-${index}-error`

                const amountId = `allowance-amount-${index}`
                const amountErrorId = `allowance-amount-${index}-error`

                return (
                  <div
                    key={index}
                    className='grid grid-cols-1 gap-3 rounded-lg border bg-muted/10 p-3 sm:grid-cols-[minmax(0,1fr)_180px_40px] sm:items-end'
                  >
                    {/* Allowance Type */}
                    <div className='space-y-2'>
                      <FloatingField
                        id={typeId}
                        label={t('allowanceType')}
                        filled={Boolean(allowance.type)}
                        invalid={Boolean(typeError)}
                        required
                      >
                        <AllowanceTypeCombobox
                          id={typeId}
                          hidePlaceholder
                          required
                          ariaInvalid={Boolean(typeError)}
                          ariaDescribedBy={typeError ? typeErrorId : undefined}
                          value={allowance.type}
                          options={getAvailableAllowanceTypes(index)}
                          onChange={(selectedType) =>
                            updateAllowance(index, 'type', selectedType)
                          }
                        />
                      </FloatingField>

                      {typeError && (
                        <p
                          id={typeErrorId}
                          className='text-xs font-medium text-destructive'
                        >
                          {typeError}
                        </p>
                      )}
                    </div>

                    {/* Allowance Amount */}
                    <div className='space-y-2'>
                      <FloatingField
                        id={amountId}
                        label={t('amount')}
                        filled={
                          allowance.amount !== null &&
                          allowance.amount !== undefined
                        }
                        invalid={Boolean(amountError)}
                        required
                      >
                        <div className='relative' dir='ltr'>
                          <span
                            aria-hidden='true'
                            className='pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-base font-medium text-muted-foreground'
                          >
                            <SaudiRiyalSymbol
                              showAccessibleText={false}
                              className='text-base'
                            />
                          </span>

                          <Input
                            id={amountId}
                            data-money-input='true'
                            type='number'
                            dir='ltr'
                            min='0'
                            step='0.01'
                            inputMode='decimal'
                            required
                            className='ps-10 pe-12 text-left'
                            value={allowance.amount ?? ''}
                            aria-invalid={Boolean(amountError)}
                            aria-describedby={
                              amountError ? amountErrorId : undefined
                            }
                            onChange={(event) =>
                              updateAllowance(
                                index,
                                'amount',
                                event.target.value,
                              )
                            }
                          />

                          {/* <div className='absolute right-2 top-1/2 flex h-9 w-7 -translate-y-1/2 flex-col gap-0.5'>
                            <button
                              type='button'
                              tabIndex={-1}
                              aria-label={t('increaseAmount')}
                              onClick={() => stepAllowanceAmount(index, 1)}
                              className='flex flex-1 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                            >
                              <ChevronUp className='size-3.5' />
                            </button>

                            <button
                              type='button'
                              tabIndex={-1}
                              aria-label={t('decreaseAmount')}
                              onClick={() => stepAllowanceAmount(index, -1)}
                              className='flex flex-1 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                            >
                              <ChevronDown className='size-3.5' />
                            </button>
                          </div> */}
                          <div className='absolute right-2 top-1/2 flex h-7 w-6 -translate-y-1/2 flex-col overflow-hidden rounded-md'>
                            <button
                              type='button'
                              aria-label={t('increaseAmount')}
                              onClick={() => stepAllowanceAmount(index, 1)}
                              className='flex flex-1 items-center justify-center rounded-t-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                            >
                              <ChevronUp className='size-3.5' />
                            </button>

                            <div className='mx-1 border-t border-border/40' />

                            <button
                              type='button'
                              aria-label={t('decreaseAmount')}
                              onClick={() => stepAllowanceAmount(index, -1)}
                              className='flex flex-1 items-center justify-center rounded-b-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500'
                            >
                              <ChevronDown className='size-3.5' />
                            </button>
                          </div>
                        </div>
                      </FloatingField>

                      {amountError && (
                        <p
                          id={amountErrorId}
                          className='text-xs font-medium text-destructive'
                        >
                          {amountError}
                        </p>
                      )}
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-10 text-muted-foreground hover:text-destructive'
                      aria-label={t('removeAllowance')}
                      onClick={() => removeAllowance(index)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {allowances.length > 0 && (
            <div className='mt-5 flex justify-end border-t pt-4'>
              <div className='w-full max-w-sm space-y-2'>
                <div className='flex items-center justify-between gap-4 text-sm'>
                  <span className='text-muted-foreground'>
                    {t('baseSalary')}
                  </span>

                  <span
                    className='font-medium tabular-nums'
                    dir='ltr'
                    aria-label={`${baseSalary} Saudi Riyal`}
                  >
                    <SaudiRiyalSymbol
                      showAccessibleText={false}
                      className='text-base'
                    />{' '}
                    {Number(baseSalary).toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className='flex items-center justify-between gap-4 text-sm'>
                  <span className='text-muted-foreground'>
                    {t('totalAllowances')}
                  </span>

                  <span
                    className='font-medium tabular-nums'
                    dir='ltr'
                    aria-label={`${totalAllowances} Saudi Riyal`}
                  >
                    <SaudiRiyalSymbol
                      showAccessibleText={false}
                      className='text-base'
                    />{' '}
                    {Number(totalAllowances).toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {/* SAR */}
                  </span>
                </div>

                <div className='flex items-center justify-between gap-4 border-t pt-2'>
                  <span className='text-sm font-semibold'>
                    {t('totalMonthlyCompensation')}
                  </span>

                  <span
                    className='text-base font-semibold tabular-nums'
                    dir='ltr'
                    aria-label={`${totalMonthlyCompensation} Saudi Riyal`}
                  >
                    <SaudiRiyalSymbol
                      showAccessibleText={false}
                      className='text-base'
                    />{' '}
                    {totalMonthlyCompensation.toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {/* SAR */}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </OnboardingFormSection>
    </div>
  )
}
