'use client'

import Link from 'next/link'

import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  FilePenLine,
  MoveRight,
  UserMinus,
  UserX,
  ArrowRight,
  MoveLeft,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

import { useLocale, useTranslations } from 'next-intl'
import { EmployeeProfile } from '../../types/employee-profile.types'
import { StatusBadge } from '@/components/badges/status-badge'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { useState } from 'react'
import { useUpdatePersonalMutation } from '../../hooks/use-update-employee-profile'
import { EmployeePersonalDialog } from '@/components/dialogs/employee-personal-dialog'
import { useRenewContract } from '@/modules/hr/contracts/hooks/use-renew-contract'
import { ContractRenewalDialog } from '@/components/dialogs/contract-renewal-dialog'
import { useContractRenewalDefaults } from '@/modules/hr/contracts/hooks/use-contract-renewal-defaults'

type EmploymentStatus =
  | 'active'
  | 'terminated'
  | 'resigned'
  | 'eoc'
  | 'transferred'
  | 'retired'
  | 'on_leave'
  | 'suspended'
  | 'deceased'

function nextDay(date: string) {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

interface Props {
  profile: EmployeeProfile
}

export function EmployeeProfileHeader({ profile }: Props) {
  const p = profile.personal
  const e = profile.employment
  const locale = useLocale()
  const ct = useTranslations('common')
  const cont = useTranslations('contracts')
  const et = useTranslations('employees')
  const isRtl = locale === 'ar'

  const employmentStatusLabels: Record<EmploymentStatus, string> = {
    active: et('employmentStatuses.active'),
    terminated: et('employmentStatuses.terminated'),
    resigned: et('employmentStatuses.resigned'),
    eoc: et('employmentStatuses.eoc'),
    transferred: et('employmentStatuses.transferred'),
    retired: et('employmentStatuses.retired'),
    on_leave: et('employmentStatuses.onLeave'),
    suspended: et('employmentStatuses.suspended'),
    deceased: et('employmentStatuses.deceased'),
  }

  const employmentStatus = e?.status as EmploymentStatus | null | undefined

  const employmentStatusLabel =
    employmentStatus && employmentStatus in employmentStatusLabels
      ? employmentStatusLabels[employmentStatus]
      : undefined

  //console.log('Version receive from Props is ' + p.version)
  // console.log('Profile ')
  // console.log(profile)

  const name = isRtl
    ? [p.firstNameAr, p.secondNameAr, p.thirdNameAr, p.familyNameAr]
    : [p.firstNameEn, p.secondNameEn, p.thirdNameEn, p.familyNameEn]

  const wf = e?.movement.positionItem.workforceCategory ?? ''

  const [editOpen, setEditOpen] = useState(false)
  const updatePersonalMutation = useUpdatePersonalMutation()

  const [renewOpen, setRenewOpen] = useState(false)
  const renewMutation = useRenewContract(profile.personal.id)

  const avatar = profile.personal?.avatar
  const fullName = name.filter(Boolean).join(' ') || 'Employee profile image'

  const currentContract = e?.contract
  const currentMovement = e?.movement

  const { data: renewalDefaults, isLoading: isRenewalDefaultsLoading } =
    useContractRenewalDefaults(currentContract?.id, renewOpen)

  //console.log('Renewal Defaults: ', renewalDefaults)

  return (
    <div className='overflow-hidden rounded-2xl border bg-background shadow-sm'>
      <div className='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-4 text-white'>
        <div className='flex items-center justify-between gap-4'>
          <Link href={`/${locale}/employees`}>
            <Button
              variant='ghost'
              className='text-white hover:bg-white/10 hover:text-white'
            >
              {isRtl ? (
                <ArrowRight className='mr-2 h-4 w-4' />
              ) : (
                <ArrowLeft className='mr-2 h-4 w-4' />
              )}
              {ct('back')}
            </Button>
          </Link>

          <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='text-white hover:bg-white/10 hover:text-white'
              >
                <MoreVertical className='h-5 w-5 text-green-700' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className='mr-2 h-4 w-4' />
                {ct('edit')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (!currentContract) return
                  setRenewOpen(true)
                }}
              >
                <FilePenLine className='mr-2 h-4 w-4' />
                {cont('renewContract')}
              </DropdownMenuItem>

              <DropdownMenuItem>
                {isRtl ? (
                  <MoveLeft className='mr-2 h-4 w-4' />
                ) : (
                  <MoveRight className='mr-2 h-4 w-4' />
                )}
                {cont('transfer')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <UserMinus className='mr-2 h-4 w-4' />
                {ct('deactivate')}
              </DropdownMenuItem>

              <DropdownMenuItem className='text-red-600 focus:text-red-600'>
                <UserX className='mr-2 h-4 w-4' />
                {ct('terminate')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='p-6'>
        <div className='flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-start'>
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className='flex w-full flex-col items-center gap-6 lg:flex-row lg:items-center'
          >
            {/* Avatar */}
            <div className='relative flex h-35 w-35 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-br from-slate-100 to-slate-200 text-6xl shadow-md dark:from-slate-800 dark:to-slate-900'>
              <Image
                src={avatar || '/MODHS3.png'}
                alt={avatar ? fullName : 'Default profile image'}
                fill
                className='object-cover'
                sizes='140px'
                priority
              />
            </div>

            {/* Identity */}
            <div className='min-w-0 w-full flex-1 space-y-3 text-center lg:text-start'>
              <div className='flex flex-col items-center gap-3 lg:flex-row lg:justify-start'>
                <h1 className='text-center text-3xl font-bold tracking-tight lg:text-start xl:text-4xl'>
                  {name.filter(Boolean).join(' ')}
                </h1>

                <StatusBadge
                  status={employmentStatus}
                  label={employmentStatusLabel}
                  className='self-center lg:self-auto'
                />
              </div>

              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>
                  {et('employeeNumber')}
                </span>{' '}
                {p.employeeNumber}
                <span className='mx-2'>•</span>
                <span className='font-medium text-foreground'>
                  {et('hireDate')}
                </span>{' '}
                {isRtl ? toArabic(e?.hireDate, 3) : e?.hireDate}
              </div>

              <div className='text-base text-muted-foreground'>
                {isRtl
                  ? (e?.movement.officialPosition.titleAr ??
                    e?.movement.officialPosition.titleEn)
                  : e?.movement.officialPosition.titleEn}

                <span className='mx-2'>•</span>

                {isRtl
                  ? (e?.movement.officialDepartment.nameAr ??
                    e?.movement.officialDepartment.nameEn)
                  : e?.movement.officialDepartment.nameEn}

                <span className='mx-2'>•</span>

                {e?.movement.positionItem.itemNumber}

                <span className='mx-2'>•</span>

                {isRtl
                  ? toPersianDigits(e?.movement.positionItem.categoryCode)
                  : e?.movement.positionItem.categoryCode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <EmployeePersonalDialog
          key={profile.personal.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSubmit={async (data) => {
            await updatePersonalMutation.mutateAsync({
              id: profile.personal.id,
              data,
            })
          }}
        />
      )}

      {renewOpen && currentContract && (
        <>
          {isRenewalDefaultsLoading || !renewalDefaults ? (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
              <div className='rounded-xl bg-background px-6 py-4 shadow-lg'>
                Loading renewal details...
              </div>
            </div>
          ) : (
            <ContractRenewalDialog
              open={renewOpen}
              onOpenChange={setRenewOpen}
              currentContractId={renewalDefaults.contract.id}
              currentPositionItemId={renewalDefaults.movement.positionItemId}
              currentItemNumber={renewalDefaults.movement.itemNumber}
              currentDepartmentId={
                renewalDefaults.movement.officialDepartmentId
              }
              currentPositionId={renewalDefaults.movement.officialPositionId}
              currentBaseSalary={renewalDefaults.compensation?.baseSalary}
              currentAllowances={renewalDefaults.compensation?.allowances ?? []}
              defaultStartDate={nextDay(renewalDefaults.contract.endDate)}
              currentDepartmentName={
                isRtl
                  ? (renewalDefaults.movement.officialDepartmentNameAr ??
                    renewalDefaults.movement.officialDepartmentNameEn)
                  : renewalDefaults.movement.officialDepartmentNameEn
              }
              currentPositionTitle={
                isRtl
                  ? (renewalDefaults.movement.officialPositionTitleAr ??
                    renewalDefaults.movement.officialPositionTitleEn)
                  : renewalDefaults.movement.officialPositionTitleEn
              }
              onSubmit={async (payload) => {
                await renewMutation.mutateAsync(payload)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
