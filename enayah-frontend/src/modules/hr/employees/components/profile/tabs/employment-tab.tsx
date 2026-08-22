'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmploymentTimeline } from '@/modules/hr/employments/hooks/use-employment-timeline'
import {
  ContractMovement,
  ContractMovementAction,
} from '@/modules/hr/employments/types/employment-timeline'
import { formatDate, humanize, toPersianDigits } from '@/utils/utilities'
import { CalendarDays, MapPin, Network, UserRound } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const movementActionOrder: Record<string, number> = {
  transfer: 1,
  promotion: 2,
  demotion: 3,
  pcn_alignment: 4,
}

const contractStatusClass: Record<string, string> = {
  draft:
    'border-slate-200 bg-slate-50 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200/60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-700/60',
  active:
    'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200/70 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/70',
  superseded:
    'border-amber-200 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-inset ring-amber-200/70 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/70',
  expired:
    'border-rose-200 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-inset ring-rose-200/70 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800/70',
  ended_early:
    'border-orange-200 bg-orange-50 text-orange-700 shadow-sm ring-1 ring-inset ring-orange-200/70 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-800/70',
  cancelled:
    'border-red-200 bg-red-50 text-red-700 shadow-sm ring-1 ring-inset ring-red-200/70 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800/70',
}

const getSortedMovementActions = (actions: ContractMovementAction[] = []) => {
  return [...actions].sort(
    (a, b) =>
      (movementActionOrder[a.actionType] ?? 999) -
      (movementActionOrder[b.actionType] ?? 999),
  )
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

interface Props {
  employeeId: string
}

interface MovementItemProps {
  movement: ContractMovement
  isRtl: boolean
}

interface ContractItemProps {
  contract: Contract
  isRtl: boolean
}

const statusVariant = (
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default'

    case 'cancelled':
    case 'terminated':
      return 'destructive'

    case 'superseded':
    case 'expired':
      return 'secondary'

    default:
      return 'outline'
  }
}

const MovementItem = ({ movement, isRtl }: MovementItemProps) => {
  const ct = useTranslations('contracts')

  const positionTitle = isRtl
    ? movement.position?.titleAr || movement.position?.titleEn
    : movement.position?.titleEn || movement.position?.titleAr

  const departmentName = isRtl
    ? movement.department?.nameAr || movement.department?.nameEn
    : movement.department?.nameEn || movement.department?.nameAr

  const sortedActions = getSortedMovementActions(movement.actions)

  return (
    <div className={['relative', isRtl ? 'pr-10' : 'pl-10'].join(' ')}>
      {/* Timeline dot */}
      <div
        className={[
          'absolute top-5 z-10 size-3 rounded-full',
          'border-2 border-background',
          'bg-foreground/80',
          isRtl ? 'right-3 translate-x-1/2' : 'left-3 -translate-x-1/2',
        ].join(' ')}
      />

      <div className='rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20'>
        {/* Date + movement type */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-1.5 text-sm font-semibold'>
            <CalendarDays className='size-3.5 text-muted-foreground' />

            <span>
              {formatDate(movement.startDate, isRtl)} {isRtl ? '←' : '→'}{' '}
              {movement.endDate ? formatDate(movement.endDate, isRtl) : '-'}
            </span>
          </div>

          {movement.movementType !== 'initial' && (
            <Badge variant='outline'>
              {humanize(ct(movement.movementType))}
            </Badge>
          )}

          {sortedActions.map((action) => (
            <Badge key={action.id} variant='secondary'>
              {humanize(ct(action.actionType))}
            </Badge>
          ))}
        </div>

        {/* Position */}
        <div className='mt-3 flex items-center gap-2'>
          <UserRound className='size-4 text-muted-foreground' />

          <span className='font-semibold'>{positionTitle ?? '-'}</span>
        </div>

        {/* PCN */}
        <div className='mt-1.5 flex items-center gap-2 text-sm text-muted-foreground'>
          <Network className='size-4 shrink-0' />

          <span className='font-mono'>
            {movement.positionItem?.itemNumber ??
              movement.positionItemId ??
              '-'}
          </span>
        </div>

        {/* Department */}
        <div className='mt-1.5 flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='size-4 shrink-0' />

          <span>{departmentName ?? '-'}</span>
        </div>

        {movement.remarks && (
          <div className='mt-3 border-t pt-3 text-sm text-muted-foreground'>
            {movement.remarks}
          </div>
        )}
      </div>
    </div>
  )
}

const ContractItem = ({ contract, isRtl }: ContractItemProps) => {
  const ct = useTranslations('contracts')

  const getContractStatusClass = (status: string) =>
    contractStatusClass[status] ??
    'border-border bg-muted text-muted-foreground'

  return (
    <section className='space-y-3'>
      {/* Contract heading */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3'>
        <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
          <CalendarDays className='size-5 shrink-0 text-primary' />

          <span className='font-semibold'>
            {humanize(ct(contract.contractType))}
          </span>

          <span className='text-sm text-muted-foreground'>
            {formatDate(contract.startDate, isRtl)} {isRtl ? '←' : '→'}{' '}
            {formatDate(contract.endDate, isRtl)}
          </span>
        </div>

        {/* <Badge variant={statusVariant(contract.status)}>
          {ct(contract.status)}
        </Badge> */}
        <Badge
          variant='outline'
          className={getContractStatusClass(contract.status)}
        >
          {ct(contract.status)}
        </Badge>
      </div>

      {/* Movements */}
      <div className='relative mt-3 space-y-4'>
        {/* Timeline line */}
        <div
          className={[
            'absolute inset-y-0 w-px',
            'bg-border/80 dark:bg-white/20',
            isRtl ? 'right-3' : 'left-3',
          ].join(' ')}
        />

        {(contract.movements ?? []).map((movement) => (
          <MovementItem key={movement.id} movement={movement} isRtl={isRtl} />
        ))}
      </div>
    </section>
  )
}

const EmploymentTimelineSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-48' />
      </CardHeader>

      <CardContent className='space-y-6'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='space-y-3'>
            <Skeleton className='h-12 w-full rounded-lg' />

            <div className='ml-5 border-l pl-6'>
              <Skeleton className='h-32 w-full rounded-lg' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const EmploymentTab = ({ employeeId }: Props) => {
  const { data, isLoading, error } = useEmploymentTimeline(employeeId)

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const ct = useTranslations('contracts')

  if (isLoading) {
    return <EmploymentTimelineSkeleton />
  }

  if (error) {
    return (
      <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive'>
        {ct('loadTimelineFailed')}
      </div>
    )
  }

  const employment = data?.[0]

  if (!employment) {
    return (
      <div className='rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground'>
        {ct('emptyTimeline')}
      </div>
    )
  }

  const contracts: Contract[] = employment.contracts ?? []

  return (
    <div className='space-y-6' dir={isRtl ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <span>
              {ct.rich('contractTimeline', {
                length: `(${
                  isRtl ? toPersianDigits(contracts.length) : contracts.length
                })`,
              })}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-8 pt-6'>
          {contracts.map((contract) => (
            <ContractItem key={contract.id} contract={contract} isRtl={isRtl} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmploymentTab
