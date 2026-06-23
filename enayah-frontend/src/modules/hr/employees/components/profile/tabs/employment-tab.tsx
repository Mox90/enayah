'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmploymentTimeline } from '@/modules/hr/employments/hooks/use-employment-timeline'
import {
  formatDate,
  humanize,
  toArabic,
  toPersianDigits,
} from '@/utils/utilities'
import { useLocale, useTranslations } from 'next-intl'

type ContractMovement = {
  id: string
  positionItemId: string
  positionItem?: {
    itemNumber?: string | null
  } | null
  department?: {
    nameEn?: string | null
    nameAr?: string | null
  } | null
  position?: {
    titleEn?: string | null
    titleAr?: string | null
  } | null
  startDate: string
  endDate?: string | null
  sequenceNumber: number
  movementType: string
  remarks?: string | null
}

type Contract = {
  id: string
  contractNumber: string
  startDate: string
  endDate: string
  contractType: string
  status: string
  signedDate?: string | null
  notes?: string | null
  movements?: ContractMovement[]
}

type Employment = {
  id: string
  hireDate: string
  startDate: string
  endDate?: string | null
  employmentType: string
  staffCategory: string
  status: string
  contracts?: Contract[]
}

interface Props {
  employeeId: string
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='font-medium'>{value ?? '-'}</div>
    </div>
  )
}

const statusClass: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  superseded: 'bg-orange-100 text-orange-700 border-orange-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
  resigned: 'bg-orange-100 text-orange-700 border-orange-200',
  eoc: 'bg-purple-100 text-purple-700 border-purple-200',
  on_leave: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const EmploymentTab = ({ employeeId }: Props) => {
  const { data, isLoading, error } = useEmploymentTimeline(employeeId)
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const ct = useTranslations('contracts')

  if (isLoading) {
    return <div>{ct('loadingTimeline')}</div>
  }

  if (error) {
    return <div>{ct('loadTimelineFailed')}</div>
  }

  const employments = data ?? []
  const employment = employments[0]

  //console.log(data)

  if (!employment) {
    return (
      <div className='rounded-lg border p-6 text-sm text-muted-foreground'>
        {ct('emptyTimeline')}
      </div>
    )
  }

  const contracts: Contract[] = employment.contracts ?? []

  return (
    <div className='space-y-6' dir={isRtl ? 'rtl' : 'ltr'}>
      {/* <Card>
        <CardHeader>
          <CardTitle>Employment Summary</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Field label='Hire Date' value={formatDate(employment.hireDate)} />
          <Field label='Start Date' value={formatDate(employment.startDate)} />
          <Field label='End Date' value={formatDate(employment.endDate)} />
          <Field
            label='Employment Type'
            value={humanize(employment.employmentType)}
          />
          <Field
            label='Staff Category'
            value={humanize(employment.staffCategory)}
          />

          <Field
            label='Status'
            value={
              <Badge
                variant='outline'
                className={statusClass[employment.status] ?? ''}
              >
                {humanize(employment.status)}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract History ({contracts.length})</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {contracts.length === 0 && (
            <div className='text-sm text-muted-foreground'>
              No contract records found.
            </div>
          )}

          {contracts.map((contract) => (
            <div key={contract.id} className='rounded-lg border p-4'>
              <div className='mb-4 flex items-start justify-between gap-4'>
                <div>
                  <div className='font-semibold'>
                    Contract #{contract.contractNumber} -{' '}
                    {humanize(contract.contractType)}
                  </div>

                  <div className='text-sm text-muted-foreground'>
                    {formatDate(contract.startDate)} →{' '}
                    {formatDate(contract.endDate)}
                  </div>
                </div>

                <Badge
                  variant='outline'
                  className={statusClass[contract.status] ?? ''}
                >
                  {humanize(contract.status)}
                </Badge>
              </div>

              <div className='mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Field
                  label='Contract Type'
                  value={humanize(contract.contractType)}
                />
                <Field
                  label='Signed Date'
                  value={formatDate(contract.signedDate)}
                />
                <Field label='Notes' value={contract.notes} />
              </div>

              <div className='space-y-3'>
                <div className='font-medium'>
                  Contract Movements ({contract.movements?.length ?? 0})
                </div>

                {contract.movements?.length ? (
                  contract.movements.map((movement) => (
                    <div
                      key={movement.id}
                      className='rounded-md border bg-muted/20 p-3'
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='font-medium'>
                          {movement.positionItem.itemNumber ??
                            movement.positionItem.positionItemId}
                        </div>

                        <Badge variant='secondary'>
                          {humanize(movement.positionItem.movementType)}
                        </Badge>
                      </div>

                      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
                        <Field
                          label='Sequence'
                          value={movement.positionItem.sequenceNumber}
                        />
                        <Field
                          label='Start Date'
                          value={formatDate(movement.positionItem.startDate)}
                        />
                        <Field
                          label='End Date'
                          value={formatDate(movement.positionItem.endDate)}
                        />
                        <Field
                          label='Department'
                          value={movement.department?.nameEn}
                        />
                        <Field
                          label='Position'
                          value={movement.position?.titleEn}
                        />
                        <Field label='Remarks' value={movement.remarks} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    No movement records for this contract.
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>
            {ct.rich('contractTimeline', {
              length: `(${isRtl ? toPersianDigits(contracts.length) : contracts.length})`,
            })}{' '}
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {contracts.map((contract) => (
            <div key={contract.id}>
              {/* Contract */}
              <div className='font-semibold'>
                🗓️ {humanize(ct(contract.contractType))}{' '}
                {new Date(contract.startDate).getFullYear()}
                <span
                  className={
                    isRtl
                      ? 'mr-2 text-sm text-muted-foreground'
                      : 'ml-2 text-sm text-muted-foreground'
                  }
                >
                  ({ct(contract.status)})
                </span>
              </div>

              {/* Movements */}
              <div
                className={
                  isRtl
                    ? 'mr-6 mt-2 space-y-4 border-r pr-6'
                    : 'ml-6 mt-2 space-y-4 border-l pl-6'
                }
              >
                {(contract.movements ?? []).map((movement) => {
                  //const last = index === arr.length - 1
                  const positionTitle = isRtl
                    ? movement.position?.titleAr || movement.position?.titleEn
                    : movement.position?.titleEn || movement.position?.titleAr

                  const departmentName = isRtl
                    ? movement.department?.nameAr || movement.department?.nameEn
                    : movement.department?.nameEn || movement.department?.nameAr

                  return (
                    <div key={movement.id} className='relative'>
                      {/* <div className='absolute -left-[1.6rem] top-0 text-muted-foreground'>
                        {last ? '└──' : '├──'}
                      </div> */}

                      <div className='space-y-1'>
                        <div className='text-sm text-muted-foreground'>
                          {isRtl
                            ? toArabic(movement.startDate, 1)
                            : formatDate(movement.startDate)}{' '}
                          {isRtl ? '←' : '→'}{' '}
                          {movement.endDate
                            ? isRtl
                              ? toArabic(movement.endDate, 1)
                              : formatDate(movement.endDate)
                            : '-'}
                          {movement.movementType !== 'initial' && (
                            <span
                              className={
                                isRtl
                                  ? 'mr-2 text-sm text-muted-foreground'
                                  : 'ml-2 text-sm text-muted-foreground'
                              }
                            >
                              ({humanize(ct(movement.movementType))})
                            </span>
                          )}
                        </div>

                        <div className='font-medium'>
                          {positionTitle ?? '-'}
                        </div>

                        <div className='text-sm text-muted-foreground'>
                          {movement.positionItem?.itemNumber ??
                            movement.positionItemId}
                        </div>

                        <div className='text-sm text-muted-foreground'>
                          {departmentName ?? '-'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmploymentTab
