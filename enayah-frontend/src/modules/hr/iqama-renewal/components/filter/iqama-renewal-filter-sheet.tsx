// enayah;frontend/src/modules/hr/iqama-renewal/components/filter/iqama-renewal-filter-sheet.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { DatePicker } from '@/components/dialogs/date-picker'
import { EnterpriseFilterCheckboxGroup } from '@/components/filter/enterprise-filter-checkbox-group'

import {
  createEmptyIqamaRenewalFilters,
  type IqamaRenewalFilters,
  type IqamaRenewalStatus,
} from '../../types/iqama-renewal.types'

interface DateRangeFilterProps {
  label: string

  from?: string
  to?: string

  fromLabel: string
  toLabel: string

  onFromChange: (value?: string) => void
  onToChange: (value?: string) => void
}

function DateRangeFilter({
  label,
  from,
  to,
  fromLabel,
  toLabel,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className='space-y-3'>
      <Label className='text-base font-medium'>{label}</Label>

      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <div className='text-xs text-muted-foreground'>{fromLabel}</div>

          <DatePicker value={from} onChange={onFromChange} />
        </div>

        <div className='space-y-1'>
          <div className='text-xs text-muted-foreground'>{toLabel}</div>

          <DatePicker value={to} onChange={onToChange} />
        </div>
      </div>
    </div>
  )
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: IqamaRenewalFilters
  onApply: (filters: IqamaRenewalFilters) => void
  onReset: () => void
}

export function IqamaRenewalFilterSheet({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const ct = useTranslations('common')

  const [local, setLocal] = useState<IqamaRenewalFilters>(() => ({
    ...values,
    statuses: [...values.statuses],
  }))

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
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
        aria-describedby='iqama'
        className='w-[450px] overflow-y-auto'
      >
        <SheetHeader>
          <SheetTitle>{t('filterCases')}</SheetTitle>
        </SheetHeader>

        <div className='mx-4 mt-6 space-y-8'>
          {/* Status */}
          <div className='space-y-4'>
            <div className='text-lg font-medium'>{t('status')}</div>

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
              onChange={(values) =>
                setLocal({
                  ...local,
                  statuses: values as IqamaRenewalStatus[],
                })
              }
            />
          </div>

          {/* Date filters */}
          <div className='space-y-6 rounded-lg border p-4'>
            <h3 className='text-lg font-semibold'>{t('dateFilters')}</h3>

            <DateRangeFilter
              label={t('expiryDate')}
              from={local.expiryDateFrom}
              to={local.expiryDateTo}
              fromLabel={ct('from')}
              toLabel={ct('to')}
              onFromChange={(expiryDateFrom) =>
                setLocal({
                  ...local,
                  expiryDateFrom,
                })
              }
              onToChange={(expiryDateTo) =>
                setLocal({
                  ...local,
                  expiryDateTo,
                })
              }
            />

            <DateRangeFilter
              label={t('mhrsdUploadDate')}
              from={local.mhrsdUploadedFrom}
              to={local.mhrsdUploadedTo}
              fromLabel={ct('from')}
              toLabel={ct('to')}
              onFromChange={(mhrsdUploadedFrom) =>
                setLocal({
                  ...local,
                  mhrsdUploadedFrom,
                })
              }
              onToChange={(mhrsdUploadedTo) =>
                setLocal({
                  ...local,
                  mhrsdUploadedTo,
                })
              }
            />

            <DateRangeFilter
              label={t('mhrsdApprovedDate')}
              from={local.mhrsdApprovedFrom}
              to={local.mhrsdApprovedTo}
              fromLabel={ct('from')}
              toLabel={ct('to')}
              onFromChange={(mhrsdApprovedFrom) =>
                setLocal({
                  ...local,
                  mhrsdApprovedFrom,
                })
              }
              onToChange={(mhrsdApprovedTo) =>
                setLocal({
                  ...local,
                  mhrsdApprovedTo,
                })
              }
            />

            <DateRangeFilter
              label={t('mhrsdDeniedDate')}
              from={local.mhrsdDeniedFrom}
              to={local.mhrsdDeniedTo}
              fromLabel={ct('from')}
              toLabel={ct('to')}
              onFromChange={(mhrsdDeniedFrom) =>
                setLocal({
                  ...local,
                  mhrsdDeniedFrom,
                })
              }
              onToChange={(mhrsdDeniedTo) =>
                setLocal({
                  ...local,
                  mhrsdDeniedTo,
                })
              }
            />

            <DateRangeFilter
              label={t('governmentRelationsDueDate')}
              from={local.governmentRelationsDueFrom}
              to={local.governmentRelationsDueTo}
              fromLabel={ct('from')}
              toLabel={ct('to')}
              onFromChange={(governmentRelationsDueFrom) =>
                setLocal({
                  ...local,
                  governmentRelationsDueFrom,
                })
              }
              onToChange={(governmentRelationsDueTo) =>
                setLocal({
                  ...local,
                  governmentRelationsDueTo,
                })
              }
            />
          </div>
        </div>

        <div className='m-4 flex gap-3'>
          <Button
            variant='outline'
            onClick={() => {
              const empty = createEmptyIqamaRenewalFilters()

              setLocal(empty)

              onReset()
            }}
          >
            {ct('reset')}
          </Button>

          <Button
            onClick={() => {
              onApply(local)
              onOpenChange(false)
            }}
          >
            {ct('apply')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
