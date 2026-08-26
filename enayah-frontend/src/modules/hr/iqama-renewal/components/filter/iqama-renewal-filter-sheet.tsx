// enayah-frontend/src/modules/hr/iqama-renewal/components/filter/iqama-renewal-filter-sheet.tsx

'use client'

import { useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { DatePicker, DatePickerValue } from '@/components/dialogs/date-picker'
import { EnterpriseFilterCheckboxGroup } from '@/components/filter/enterprise-filter-checkbox-group'

import {
  createEmptyIqamaRenewalFilters,
  type IqamaRenewalFilters,
  type IqamaRenewalStatus,
} from '../../types/iqama-renewal.types'

/* ============================================================
 * Filter Section
 * ============================================================ */

interface FilterSectionProps {
  title: string
  count?: number
  children: ReactNode
}

function FilterSection({ title, count, children }: FilterSectionProps) {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <Label className='text-sm font-semibold'>{title}</Label>

        {!!count && (
          <span className='inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground'>
            {count}
          </span>
        )}
      </div>

      {children}
    </section>
  )
}

/* ============================================================
 * Date Range
 * ============================================================ */

interface DateRangeFilterProps {
  id: string
  label: string

  from?: DatePickerValue
  to?: DatePickerValue

  fromLabel: string
  toLabel: string

  onFromChange: (value: DatePickerValue) => void
  onToChange: (value: DatePickerValue) => void
}

function DateRangeFilter({
  id,
  label,
  from,
  to,
  fromLabel,
  toLabel,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  const fromId = `${id}-from`
  const toId = `${id}-to`

  const hasValue = Boolean(from || to)

  return (
    <div className='space-y-2.5'>
      <div className='flex items-center justify-between gap-3'>
        <Label className='text-xs font-medium text-muted-foreground'>
          {label}
        </Label>

        {hasValue && (
          <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
        )}
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {/* From */}

        <div className='space-y-1.5'>
          <label
            htmlFor={fromId}
            className='block text-xs text-muted-foreground'
          >
            {fromLabel}
          </label>

          <DatePicker id={fromId} value={from} onChange={onFromChange} />
        </div>

        {/* To */}

        <div className='space-y-1.5'>
          <label htmlFor={toId} className='block text-xs text-muted-foreground'>
            {toLabel}
          </label>

          <DatePicker id={toId} value={to} onChange={onToChange} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
 * Props
 * ============================================================ */

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: IqamaRenewalFilters
  onApply: (filters: IqamaRenewalFilters) => void
  onReset: () => void
}

/* ============================================================
 * Component
 * ============================================================ */

export function IqamaRenewalFilterSheet({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
}: Props) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('iqamaRenewal')
  const ct = useTranslations('common')

  const [local, setLocal] = useState<IqamaRenewalFilters>(() => ({
    ...values,
    statuses: [...values.statuses],
  }))

  /*
   * Count individual selected filter criteria.
   *
   * Example:
   * 2 statuses
   * 1 expiry-from date
   * 1 GR due-to date
   *
   * = 4 active filters
   */
  const activeFilterCount =
    local.statuses.length +
    [
      local.expiryDateFrom,
      local.expiryDateTo,

      local.mhrsdUploadedFrom,
      local.mhrsdUploadedTo,

      local.mhrsdApprovedFrom,
      local.mhrsdApprovedTo,

      local.mhrsdDeniedFrom,
      local.mhrsdDeniedTo,

      local.governmentRelationsDueFrom,
      local.governmentRelationsDueTo,
    ].filter(Boolean).length

  /*
   * Number of active date-range groups.
   *
   * This count is displayed beside "Date Filters".
   */
  const activeDateRangeCount = [
    Boolean(local.expiryDateFrom || local.expiryDateTo),

    Boolean(local.mhrsdUploadedFrom || local.mhrsdUploadedTo),

    Boolean(local.mhrsdApprovedFrom || local.mhrsdApprovedTo),

    Boolean(local.mhrsdDeniedFrom || local.mhrsdDeniedTo),

    Boolean(local.governmentRelationsDueFrom || local.governmentRelationsDueTo),
  ].filter(Boolean).length

  function resetFilters() {
    const empty = createEmptyIqamaRenewalFilters()

    setLocal(empty)

    onReset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        /*
         * Restore the currently applied filters whenever
         * the filter sheet is opened.
         */
        if (nextOpen) {
          setLocal({
            ...values,
            statuses: [...values.statuses],
          })
        }

        onOpenChange(nextOpen)
      }}
    >
      <SheetContent
        side={isRtl ? 'left' : 'right'}
        dir={isRtl ? 'rtl' : 'ltr'}
        className='flex w-full flex-col gap-0 p-0 sm:max-w-[480px]'
      >
        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

        <SheetHeader className='shrink-0 border-b px-6 py-5'>
          <div className='flex items-start justify-between gap-4 pe-6'>
            <div className='min-w-0 space-y-1'>
              <SheetTitle className='text-lg font-semibold'>
                {t('filterCases')}
              </SheetTitle>

              <p className='text-sm leading-relaxed text-muted-foreground'>
                {t('filterCasesDescription')}
              </p>
            </div>

            {activeFilterCount > 0 && (
              <span
                className='inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary'
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* ================================================== */}
        {/* Scrollable Content */}
        {/* ================================================== */}

        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='space-y-6 px-6 py-5'>
            {/* -------------------------------------------- */}
            {/* Status */}
            {/* -------------------------------------------- */}

            <FilterSection title={t('status')} count={local.statuses.length}>
              <EnterpriseFilterCheckboxGroup
                values={local.statuses}
                options={[
                  {
                    value: 'pending_upload',
                    label: t('statuses.pending_upload'),
                  },
                  {
                    value: 'uploaded_to_mhrsd',
                    label: t('statuses.uploaded_to_mhrsd'),
                  },
                  {
                    value: 'under_process',
                    label: t('statuses.under_process'),
                  },
                  {
                    value: 'approved_by_mhrsd',
                    label: t('statuses.approved_by_mhrsd'),
                  },
                  {
                    value: 'denied_by_mhrsd',
                    label: t('statuses.denied_by_mhrsd'),
                  },
                  {
                    value: 'sent_to_government_relations',
                    label: t('statuses.sent_to_government_relations'),
                  },
                  {
                    value: 'completed',
                    label: t('statuses.completed'),
                  },
                  {
                    value: 'eoc_required',
                    label: t('statuses.eoc_required'),
                  },
                  {
                    value: 'cancelled',
                    label: t('statuses.cancelled'),
                  },
                ]}
                onChange={(statuses) =>
                  setLocal((current) => ({
                    ...current,

                    statuses: statuses as IqamaRenewalStatus[],
                  }))
                }
              />
            </FilterSection>

            <Separator />

            {/* -------------------------------------------- */}
            {/* Date Filters */}
            {/* -------------------------------------------- */}

            <FilterSection
              title={t('dateFilters')}
              count={activeDateRangeCount}
            >
              <div className='space-y-5'>
                {/* Expiry Date */}

                <DateRangeFilter
                  id='expiry-date'
                  label={t('expiryDate')}
                  from={local.expiryDateFrom}
                  to={local.expiryDateTo}
                  fromLabel={ct('from')}
                  toLabel={ct('to')}
                  onFromChange={(expiryDateFrom) =>
                    setLocal((current) => ({
                      ...current,
                      expiryDateFrom,
                    }))
                  }
                  onToChange={(expiryDateTo) =>
                    setLocal((current) => ({
                      ...current,
                      expiryDateTo,
                    }))
                  }
                />

                <Separator className='opacity-50' />

                {/* MHRSD Upload Date */}

                <DateRangeFilter
                  id='mhrsd-upload-date'
                  label={t('mhrsdUploadDate')}
                  from={local.mhrsdUploadedFrom}
                  to={local.mhrsdUploadedTo}
                  fromLabel={ct('from')}
                  toLabel={ct('to')}
                  onFromChange={(mhrsdUploadedFrom) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdUploadedFrom,
                    }))
                  }
                  onToChange={(mhrsdUploadedTo) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdUploadedTo,
                    }))
                  }
                />

                <Separator className='opacity-50' />

                {/* MHRSD Approved Date */}

                <DateRangeFilter
                  id='mhrsd-approved-date'
                  label={t('mhrsdApprovedDate')}
                  from={local.mhrsdApprovedFrom}
                  to={local.mhrsdApprovedTo}
                  fromLabel={ct('from')}
                  toLabel={ct('to')}
                  onFromChange={(mhrsdApprovedFrom) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdApprovedFrom,
                    }))
                  }
                  onToChange={(mhrsdApprovedTo) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdApprovedTo,
                    }))
                  }
                />

                <Separator className='opacity-50' />

                {/* MHRSD Denied Date */}

                <DateRangeFilter
                  id='mhrsd-denied-date'
                  label={t('mhrsdDeniedDate')}
                  from={local.mhrsdDeniedFrom}
                  to={local.mhrsdDeniedTo}
                  fromLabel={ct('from')}
                  toLabel={ct('to')}
                  onFromChange={(mhrsdDeniedFrom) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdDeniedFrom,
                    }))
                  }
                  onToChange={(mhrsdDeniedTo) =>
                    setLocal((current) => ({
                      ...current,
                      mhrsdDeniedTo,
                    }))
                  }
                />

                <Separator className='opacity-50' />

                {/* Government Relations Due Date */}

                <DateRangeFilter
                  id='government-relations-due-date'
                  label={t('governmentRelationsDueDate')}
                  from={local.governmentRelationsDueFrom}
                  to={local.governmentRelationsDueTo}
                  fromLabel={ct('from')}
                  toLabel={ct('to')}
                  onFromChange={(governmentRelationsDueFrom) =>
                    setLocal((current) => ({
                      ...current,

                      governmentRelationsDueFrom,
                    }))
                  }
                  onToChange={(governmentRelationsDueTo) =>
                    setLocal((current) => ({
                      ...current,

                      governmentRelationsDueTo,
                    }))
                  }
                />
              </div>
            </FilterSection>
          </div>
        </div>

        {/* ================================================== */}
        {/* Footer */}
        {/* ================================================== */}

        <div className='shrink-0 border-t bg-background px-6 py-4'>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              disabled={activeFilterCount === 0}
              onClick={resetFilters}
            >
              {ct('reset')}
            </Button>

            <Button
              type='button'
              className='flex-[1.5]'
              onClick={() => {
                onApply(local)
                onOpenChange(false)
              }}
            >
              {ct('apply')}

              {activeFilterCount > 0 && (
                <span className='ms-1.5 opacity-70'>({activeFilterCount})</span>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
