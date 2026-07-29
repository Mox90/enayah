// enayah-frontend/src/moduesl/hr/employees/componets/profile/employee-profile-header.tsx

// 'use client'

// import Link from 'next/link'

// import {
//   ArrowLeft,
//   MoreVertical,
//   Pencil,
//   FilePenLine,
//   MoveRight,
//   UserMinus,
//   UserX,
//   ArrowRight,
//   MoveLeft,
// } from 'lucide-react'

// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from '@/components/ui/dropdown-menu'

// import { Button } from '@/components/ui/button'
// import Image from 'next/image'

// import { useLocale, useTranslations } from 'next-intl'
// import { EmployeeProfile } from '../../types/employee-profile.types'
// import { StatusBadge } from '@/components/badges/status-badge'
// import { toArabic, toPersianDigits } from '@/utils/utilities'
// import { useState } from 'react'
// import { useUpdatePersonalMutation } from '../../hooks/use-update-employee-profile'
// import { EmployeePersonalDialog } from '@/components/dialogs/employee-personal-dialog'
// import { useRenewContract } from '@/modules/hr/contracts/hooks/use-renew-contract'
// import { ContractRenewalDialog } from '@/components/dialogs/contract-renewal-dialog'
// import { useContractRenewalDefaults } from '@/modules/hr/contracts/hooks/use-contract-renewal-defaults'

// type EmploymentStatus =
//   | 'active'
//   | 'terminated'
//   | 'resigned'
//   | 'eoc'
//   | 'transferred'
//   | 'retired'
//   | 'on_leave'
//   | 'suspended'
//   | 'deceased'

// function nextDay(date: string) {
//   const d = new Date(date)
//   d.setDate(d.getDate() + 1)
//   return d.toISOString().slice(0, 10)
// }

// interface Props {
//   profile: EmployeeProfile
// }

// export function EmployeeProfileHeader({ profile }: Props) {
//   const p = profile.personal
//   const e = profile.employment
//   const locale = useLocale()
//   const ct = useTranslations('common')
//   const cont = useTranslations('contracts')
//   const et = useTranslations('employees')
//   const isRtl = locale === 'ar'

//   const employmentStatusLabels: Record<EmploymentStatus, string> = {
//     active: et('employmentStatuses.active'),
//     terminated: et('employmentStatuses.terminated'),
//     resigned: et('employmentStatuses.resigned'),
//     eoc: et('employmentStatuses.eoc'),
//     transferred: et('employmentStatuses.transferred'),
//     retired: et('employmentStatuses.retired'),
//     on_leave: et('employmentStatuses.onLeave'),
//     suspended: et('employmentStatuses.suspended'),
//     deceased: et('employmentStatuses.deceased'),
//   }

//   const employmentStatus = e?.status as EmploymentStatus | null | undefined

//   const employmentStatusLabel =
//     employmentStatus && employmentStatus in employmentStatusLabels
//       ? employmentStatusLabels[employmentStatus]
//       : undefined

//   //console.log('Version receive from Props is ' + p.version)
//   // console.log('Profile ')
//   // console.log(profile)

//   const name = isRtl
//     ? [p.firstNameAr, p.secondNameAr, p.thirdNameAr, p.familyNameAr]
//     : [p.firstNameEn, p.secondNameEn, p.thirdNameEn, p.familyNameEn]

//   //const wf = e?.movement.positionItem.workforceCategory ?? ''

//   const [editOpen, setEditOpen] = useState(false)
//   const updatePersonalMutation = useUpdatePersonalMutation()

//   const [renewOpen, setRenewOpen] = useState(false)
//   const renewMutation = useRenewContract(profile.personal.id)

//   const avatar = profile.personal?.avatar
//   const fullName = name.filter(Boolean).join(' ') || 'Employee profile image'

//   const currentContract = e?.contract
//   //const currentMovement = e?.movement

//   const { data: renewalDefaults, isLoading: isRenewalDefaultsLoading } =
//     useContractRenewalDefaults(currentContract?.id, renewOpen)

//   //console.log('Renewal Defaults: ', renewalDefaults)

//   return (
//     <div className='overflow-hidden rounded-2xl border bg-background shadow-sm'>
//       <div className='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-4 text-white'>
//         <div className='flex items-center justify-between gap-4'>
//           <Link href={`/${locale}/employees`}>
//             <Button
//               variant='ghost'
//               className='text-white hover:bg-white/10 hover:text-white'
//             >
//               {isRtl ? (
//                 <ArrowRight className='mr-2 h-4 w-4' />
//               ) : (
//                 <ArrowLeft className='mr-2 h-4 w-4' />
//               )}
//               {ct('back')}
//             </Button>
//           </Link>

//           <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant='ghost'
//                 size='icon'
//                 className='text-white hover:bg-white/10 hover:text-white'
//               >
//                 <MoreVertical className='h-5 w-5 text-green-700' />
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent align='end' className='w-52'>
//               <DropdownMenuItem onClick={() => setEditOpen(true)}>
//                 <Pencil className='mr-2 h-4 w-4' />
//                 {ct('edit')}
//               </DropdownMenuItem>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem
//                 onClick={() => {
//                   if (!currentContract) return
//                   setRenewOpen(true)
//                 }}
//               >
//                 <FilePenLine className='mr-2 h-4 w-4' />
//                 {cont('renewContract')}
//               </DropdownMenuItem>

//               <DropdownMenuItem>
//                 {isRtl ? (
//                   <MoveLeft className='mr-2 h-4 w-4' />
//                 ) : (
//                   <MoveRight className='mr-2 h-4 w-4' />
//                 )}
//                 {cont('transfer')}
//               </DropdownMenuItem>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem>
//                 <UserMinus className='mr-2 h-4 w-4' />
//                 {ct('deactivate')}
//               </DropdownMenuItem>

//               <DropdownMenuItem className='text-red-600 focus:text-red-600'>
//                 <UserX className='mr-2 h-4 w-4' />
//                 {ct('terminate')}
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       <div className='p-6'>
//         <div className='flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-start'>
//           <div
//             dir={isRtl ? 'rtl' : 'ltr'}
//             className='flex w-full flex-col items-center gap-6 lg:flex-row lg:items-center'
//           >
//             {/* Avatar */}
//             <div className='relative flex h-35 w-35 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-br from-slate-100 to-slate-200 text-6xl shadow-md dark:from-slate-800 dark:to-slate-900'>
//               <Image
//                 src={avatar || '/MODHS3.png'}
//                 alt={avatar ? fullName : 'Default profile image'}
//                 fill
//                 className='object-cover'
//                 sizes='140px'
//                 priority
//               />
//             </div>

//             {/* Identity */}
//             <div className='min-w-0 w-full flex-1 space-y-3 text-center lg:text-start'>
//               <div className='flex flex-col items-center gap-3 lg:flex-row lg:justify-start'>
//                 <h1 className='text-center text-3xl font-bold tracking-tight lg:text-start xl:text-4xl'>
//                   {name.filter(Boolean).join(' ')}
//                 </h1>

//                 <StatusBadge
//                   status={employmentStatus}
//                   label={employmentStatusLabel}
//                   className='self-center lg:self-auto'
//                 />
//               </div>

//               <div className='text-sm text-muted-foreground'>
//                 <span className='font-medium text-foreground'>
//                   {et('employeeNumber')}
//                 </span>{' '}
//                 {p.employeeNumber}
//                 <span className='mx-2'>•</span>
//                 <span className='font-medium text-foreground'>
//                   {et('hireDate')}
//                 </span>{' '}
//                 {isRtl ? toArabic(e?.hireDate, 3) : e?.hireDate}
//               </div>

//               <div className='text-base text-muted-foreground'>
//                 {isRtl
//                   ? (e?.movement.officialPosition.titleAr ??
//                     e?.movement.officialPosition.titleEn)
//                   : e?.movement.officialPosition.titleEn}

//                 <span className='mx-2'>•</span>

//                 {isRtl
//                   ? (e?.movement.officialDepartment.nameAr ??
//                     e?.movement.officialDepartment.nameEn)
//                   : e?.movement.officialDepartment.nameEn}

//                 <span className='mx-2'>•</span>

//                 {e?.movement.positionItem.itemNumber}

//                 <span className='mx-2'>•</span>

//                 {isRtl
//                   ? toPersianDigits(e?.movement.positionItem.categoryCode)
//                   : e?.movement.positionItem.categoryCode}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {editOpen && (
//         <EmployeePersonalDialog
//           key={profile.personal.id}
//           open={editOpen}
//           onOpenChange={setEditOpen}
//           profile={profile}
//           onSubmit={async (data) => {
//             await updatePersonalMutation.mutateAsync({
//               id: profile.personal.id,
//               data,
//             })
//           }}
//         />
//       )}

//       {renewOpen && currentContract && (
//         <>
//           {isRenewalDefaultsLoading || !renewalDefaults ? (
//             <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
//               <div className='rounded-xl bg-background px-6 py-4 shadow-lg'>
//                 Loading renewal details...
//               </div>
//             </div>
//           ) : (
//             <ContractRenewalDialog
//               open={renewOpen}
//               onOpenChange={setRenewOpen}
//               currentContractId={renewalDefaults.contract.id}
//               currentPositionItemId={renewalDefaults.movement.positionItemId}
//               currentItemNumber={renewalDefaults.movement.itemNumber}
//               currentDepartmentId={
//                 renewalDefaults.movement.officialDepartmentId
//               }
//               currentPositionId={renewalDefaults.movement.officialPositionId}
//               currentBaseSalary={renewalDefaults.compensation?.baseSalary}
//               currentAllowances={renewalDefaults.compensation?.allowances ?? []}
//               defaultStartDate={nextDay(renewalDefaults.contract.endDate)}
//               currentDepartmentName={
//                 isRtl
//                   ? (renewalDefaults.movement.officialDepartmentNameAr ??
//                     renewalDefaults.movement.officialDepartmentNameEn)
//                   : renewalDefaults.movement.officialDepartmentNameEn
//               }
//               currentPositionTitle={
//                 isRtl
//                   ? (renewalDefaults.movement.officialPositionTitleAr ??
//                     renewalDefaults.movement.officialPositionTitleEn)
//                   : renewalDefaults.movement.officialPositionTitleEn
//               }
//               onSubmit={async (payload) => {
//                 await renewMutation.mutateAsync(payload)
//               }}
//             />
//           )}
//         </>
//       )}
//     </div>
//   )
// }

// enayah-frontend/src/modules/hr/employees/components/profile/employee-profile-header.tsx

'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { addDays, format, isValid, parseISO } from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FilePenLine,
  Hash,
  IdCard,
  Layers3,
  LoaderCircle,
  MoreVertical,
  MoveLeft,
  MoveRight,
  Pencil,
  UserMinus,
  UserX,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/badges/status-badge'
import { EmployeePersonalDialog } from '@/components/dialogs/employee-personal-dialog'
import { ContractRenewalDialog } from '@/components/dialogs/contract-renewal-dialog'
import { cn } from '@/lib/utils'
import { formatDate, toArabic, toPersianDigits } from '@/utils/utilities'

import { EmployeeProfile } from '../../types/employee-profile.types'
import { useUpdatePersonalMutation } from '../../hooks/use-update-employee-profile'
import { useRenewContract } from '@/modules/hr/contracts/hooks/use-renew-contract'
import { useContractRenewalDefaults } from '@/modules/hr/contracts/hooks/use-contract-renewal-defaults'
import { EmployeeAvatarUploader } from './employee-avatar-uploader'

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

interface Props {
  profile: EmployeeProfile
  onAvatarUpload?: (file: File) => Promise<void>
}

interface ProfileMetaItemProps {
  icon: ReactNode
  label: string
  value?: ReactNode
  valueDirection?: 'ltr' | 'rtl'
  isRtl: boolean
  className?: string
}

function ProfileMetaItem({
  icon,
  label,
  value,
  valueDirection,
  isRtl,
  className,
}: ProfileMetaItemProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        'flex min-w-0 items-start gap-3 rounded-xl',
        'border bg-background/70 px-4 py-3',
        'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        className,
      )}
    >
      {/* 
        First DOM element:
        - appears on the left in LTR
        - appears on the right in RTL
      */}
      <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
        {icon}
      </div>

      {/* Fills the remaining space, but content stays beside the icon */}
      <div className={cn('min-w-0 flex-1', isRtl ? 'text-right' : 'text-left')}>
        <div className='text-xs font-medium text-muted-foreground'>{label}</div>

        <div
          title={typeof value === 'string' ? value : undefined}
          className={cn(
            'mt-0.5 truncate text-sm font-semibold text-foreground',
            isRtl ? 'text-right' : 'text-left',
          )}
        >
          <span
            dir={valueDirection ?? (isRtl ? 'rtl' : 'ltr')}
            className='inline-block max-w-full'
          >
            {hasValue ? value : '-'}
          </span>
        </div>
      </div>
    </div>
  )
}

function getNextDay(date: string) {
  const parsedDate = parseISO(date)

  if (!isValid(parsedDate)) {
    return ''
  }

  return format(addDays(parsedDate, 1), 'yyyy-MM-dd')
}

// function formatProfileDate(value: string | null | undefined, isRtl: boolean) {
//   if (!value) {
//     return '-'
//   }

//   if (isRtl) {
//     return toArabic(value, 3)
//   }

//   const parsedDate = parseISO(value)

//   if (!isValid(parsedDate)) {
//     return '-'
//   }

//   return format(parsedDate, 'dd MMM yyyy')
// }

function localizeValue(
  value: string | number | null | undefined,
  isRtl: boolean,
) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return isRtl ? toPersianDigits(value) : String(value)
}

export function EmployeeProfileHeader({ profile, onAvatarUpload }: Props) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const ct = useTranslations('common')
  const cont = useTranslations('contracts')
  const et = useTranslations('employees')

  const [editOpen, setEditOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)

  const updatePersonalMutation = useUpdatePersonalMutation()

  const renewMutation = useRenewContract(profile.personal.id)

  const personal = profile.personal
  const employment = profile.employment
  const movement = employment?.movement
  const currentContract = employment?.contract

  const avatar = personal.avatar

  const nameParts = isRtl
    ? [
        personal.firstNameAr,
        personal.secondNameAr,
        personal.thirdNameAr,
        personal.familyNameAr,
      ]
    : [
        personal.firstNameEn,
        personal.secondNameEn,
        personal.thirdNameEn,
        personal.familyNameEn,
      ]

  const fullName =
    nameParts.filter(Boolean).join(' ') ||
    (isRtl ? 'ملف الموظف' : 'Employee profile')

  const positionTitle = isRtl
    ? (movement?.officialPosition?.titleAr ??
      movement?.officialPosition?.titleEn)
    : movement?.officialPosition?.titleEn

  const departmentName = isRtl
    ? (movement?.officialDepartment?.nameAr ??
      movement?.officialDepartment?.nameEn)
    : movement?.officialDepartment?.nameEn

  const employmentStatus = employment?.status as
    | EmploymentStatus
    | null
    | undefined

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

  const employmentStatusLabel =
    employmentStatus && employmentStatus in employmentStatusLabels
      ? employmentStatusLabels[employmentStatus]
      : undefined

  const positionItemLabel = isRtl ? 'رقم البند' : 'Position item'

  const categoryLabel = isRtl ? 'الفئة' : 'Category'

  const employeeActionsLabel = isRtl ? 'إجراءات الموظف' : 'Employee actions'

  const loadingRenewalLabel = isRtl
    ? 'جارٍ تحميل بيانات تجديد العقد...'
    : 'Loading contract renewal details...'

  const { data: renewalDefaults, isLoading: isRenewalDefaultsLoading } =
    useContractRenewalDefaults(currentContract?.id, renewOpen)

  return (
    <section
      aria-labelledby='employee-profile-name'
      className='overflow-hidden rounded-2xl border bg-card shadow-sm'
    >
      {/* Top action bar */}
      <div className='border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-3 text-white sm:px-6'>
        <div className='flex items-center justify-between gap-4'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='text-white hover:bg-white/10 hover:text-white'
          >
            <Link href={`/${locale}/employees`}>
              {isRtl ? (
                <ArrowRight aria-hidden='true' className='me-2 h-4 w-4' />
              ) : (
                <ArrowLeft aria-hidden='true' className='me-2 h-4 w-4' />
              )}

              {ct('back')}
            </Link>
          </Button>

          <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label={employeeActionsLabel}
                className='text-green-700 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10'
              >
                <MoreVertical aria-hidden='true' className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' sideOffset={8} className='w-56'>
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil aria-hidden='true' className='me-2 h-4 w-4' />
                {ct('edit')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={!currentContract || renewMutation.isPending}
                onSelect={() => {
                  if (!currentContract) {
                    return
                  }

                  setRenewOpen(true)
                }}
              >
                <FilePenLine aria-hidden='true' className='me-2 h-4 w-4' />
                {cont('renewContract')}
              </DropdownMenuItem>

              <DropdownMenuItem>
                {isRtl ? (
                  <MoveLeft aria-hidden='true' className='me-2 h-4 w-4' />
                ) : (
                  <MoveRight aria-hidden='true' className='me-2 h-4 w-4' />
                )}

                {cont('transfer')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className='text-amber-700 focus:bg-amber-50 focus:text-amber-800 dark:text-amber-400 dark:focus:bg-amber-950/30 dark:focus:text-amber-300'>
                <UserMinus aria-hidden='true' className='me-2 h-4 w-4' />
                {ct('deactivate')}
              </DropdownMenuItem>

              <DropdownMenuItem className='text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300'>
                <UserX aria-hidden='true' className='me-2 h-4 w-4' />
                {ct('terminate')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile identity */}
      <div className='bg-gradient-to-br from-background via-background to-muted/30 p-5 sm:p-6 lg:p-8'>
        <div className='flex flex-col items-center gap-6 lg:flex-row lg:items-start'>
          {/* <div className='relative shrink-0'>
            <div className='relative h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg ring-1 ring-border sm:h-32 sm:w-32'>
              <Image
                src={avatar || '/MODHS3.png'}
                alt={
                  avatar
                    ? fullName
                    : isRtl
                      ? 'الصورة الافتراضية للموظف'
                      : 'Default employee profile image'
                }
                fill
                priority
                sizes='(max-width: 640px) 112px, 128px'
                className='object-cover'
              />
            </div>
          </div> */}
          <EmployeeAvatarUploader
            avatar={avatar}
            employeeName={fullName}
            isRtl={isRtl}
            onUpload={onAvatarUpload}
          />

          <div className='min-w-0 flex-1 text-center lg:text-start'>
            <div className='flex flex-col items-center gap-3 lg:flex-row lg:items-center'>
              <h1
                id='employee-profile-name'
                className='break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl xl:text-4xl'
              >
                {fullName}
              </h1>

              <StatusBadge
                status={employmentStatus}
                label={employmentStatusLabel}
                className='shrink-0'
              />
            </div>

            <div className='mt-3 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap lg:justify-start'>
              <div className='flex min-w-0 items-center gap-2'>
                <BriefcaseBusiness
                  aria-hidden='true'
                  className='h-4 w-4 shrink-0'
                />

                <span className='truncate font-medium text-foreground'>
                  {positionTitle || '-'}
                </span>
              </div>

              <span aria-hidden='true' className='hidden text-border sm:inline'>
                •
              </span>

              <div className='flex min-w-0 items-center gap-2'>
                <Building2 aria-hidden='true' className='h-4 w-4 shrink-0' />

                <span className='truncate'>{departmentName || '-'}</span>
              </div>
            </div>

            <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <ProfileMetaItem
                isRtl={isRtl}
                icon={<IdCard aria-hidden='true' className='h-4 w-4' />}
                label={et('employeeNumber')}
                value={localizeValue(personal.employeeNumber, isRtl)}
                valueDirection='ltr'
              />

              <ProfileMetaItem
                isRtl={isRtl}
                icon={<CalendarDays aria-hidden='true' className='h-4 w-4' />}
                label={et('hireDate')}
                value={formatDate(employment?.hireDate, isRtl)}
                valueDirection='ltr'
              />

              <ProfileMetaItem
                isRtl={isRtl}
                icon={<Hash aria-hidden='true' className='h-4 w-4' />}
                label={positionItemLabel}
                value={localizeValue(movement?.positionItem?.itemNumber, isRtl)}
                valueDirection='ltr'
              />

              <ProfileMetaItem
                isRtl={isRtl}
                icon={<Layers3 aria-hidden='true' className='h-4 w-4' />}
                label={categoryLabel}
                value={localizeValue(
                  movement?.positionItem?.categoryCode,
                  isRtl,
                )}
                valueDirection='ltr'
              />
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <EmployeePersonalDialog
          key={personal.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSubmit={async (data) => {
            await updatePersonalMutation.mutateAsync({
              id: personal.id,
              data,
            })
          }}
        />
      )}

      {renewOpen && currentContract && (
        <>
          {isRenewalDefaultsLoading || !renewalDefaults ? (
            <div
              role='status'
              aria-live='polite'
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'
            >
              <div className='flex items-center gap-3 rounded-xl border bg-background/95 px-6 py-4 shadow-xl'>
                <LoaderCircle
                  aria-hidden='true'
                  className='h-5 w-5 animate-spin text-primary'
                />

                <span className='text-sm font-medium'>
                  {loadingRenewalLabel}
                </span>
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
              defaultStartDate={getNextDay(renewalDefaults.contract.endDate)}
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
    </section>
  )
}
