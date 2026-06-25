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

import { Badge } from '@/components/ui/badge'
import { useLocale, useTranslations } from 'next-intl'
import { EmployeeProfile } from '../../types/employee-profile.types'
import { StatusBadge } from '@/components/badges/status-badge'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { useState } from 'react'
import { useUpdatePersonalMutation } from '../../hooks/use-update-employee-profile'
import { EmployeePersonalDialog } from '@/components/dialogs/employee-personal-dialog'

const statusClass: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  on_leave: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  transferred: 'bg-blue-100 text-blue-700 border-blue-200',
  resigned: 'bg-orange-100 text-orange-700 border-orange-200',
  eoc: 'bg-purple-100 text-purple-700 border-purple-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabel: Record<string, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  transferred: 'Transferred',
  resigned: 'Resigned',
  eoc: 'End of Contract',
  terminated: 'Terminated',
}

// const workforceLabel: Record<string, string> = {
//   physician: 'Physician', // 1000
//   nurse: 'Nurse', // 2000
//   allied_health: 'Allied Health/Technician', // 3000
//   administrative: 'Administrative', // 4000
//   support_service: 'Support Service', //5000
// }

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

  //console.log('Version receive from Props is ' + p.version)

  const name = isRtl
    ? [p.firstNameAr, p.secondNameAr, p.thirdNameAr, p.familyNameAr]
    : [p.firstNameEn, p.secondNameEn, p.thirdNameEn, p.familyNameEn]

  const wf = e?.movement.positionItem.workforceCategory ?? ''

  const [editOpen, setEditOpen] = useState(false)
  const updatePersonalMutation = useUpdatePersonalMutation()

  const avatar = profile.personal?.avatar
  const fullName = name.filter(Boolean).join(' ') || 'Employee profile image'

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
                <MoreVertical className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className='mr-2 h-4 w-4' />
                {ct('edit')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <FilePenLine className='mr-2 h-4 w-4' />
                {cont('contract')}
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
          <div className='flex flex-col items-center gap-6 lg:flex-row lg:items-center'>
            {/* Avatar */}
            <div className='relative flex h-35 w-35 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-br from-slate-100 to-slate-200 text-6xl shadow-md dark:from-slate-800 dark:to-slate-900'>
              {/* {profile.personal?.avatar ? (
                <Image
                  src={profile.personal?.avatar}
                  alt={name.filter(Boolean).join(' ')}
                  fill
                  className='object-cover'
                  sizes='140px'
                  priority
                />
              ) : (
                // <span>👤</span>
                <Image
                  src='/MODHS3.png'
                  alt='Default profile image'
                  fill
                  className='object-cover'
                  sizes='140px'
                  priority
                />
              )} */}
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
            <div className='min-w-0 flex-1 space-y-3 text-center lg:text-left'>
              <div className='flex flex-col items-center gap-3 lg:flex-row'>
                <h1 className='text-center text-3xl font-bold tracking-tight lg:text-left xl:text-4xl'>
                  {name.filter(Boolean).join(' ')}
                </h1>

                <StatusBadge
                  className='self-center lg:self-auto'
                  status={e?.status}
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
                {/* <span className='font-medium'>{et('pcnText')}</span>{' '} */}
                {e?.movement.positionItem.itemNumber}
                <span className='mx-2'>•</span>
                {/* <span className='font-medium'>{et('category')}</span>{' '} */}
                {isRtl
                  ? toPersianDigits(e?.movement.positionItem.categoryCode)
                  : e?.movement.positionItem.categoryCode}
                {/* <span className='mx-2'>•</span>
                <span className='font-medium'>{et('workforce')}</span> {et(wf)} */}
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
    </div>
  )
}
