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
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { EmployeeProfile } from '../../types/employee-directory.types'
import { useLocale } from 'next-intl'

//import { EmployeeProfile } from '../../types/employee-profile.types'

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

interface Props {
  profile: EmployeeProfile
}

export function EmployeeProfileHeader({ profile }: Props) {
  const p = profile.personal
  const e = profile.employment
  const locale = useLocale()

  return (
    <div className='rounded-xl border bg-background p-6'>
      <div className='flex justify-between'>
        <Link href={`/${locale}/employees`}>
          <Button variant='ghost'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <MoreVertical className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <FilePenLine className='mr-2 h-4 w-4' />
              Contract
            </DropdownMenuItem>

            <DropdownMenuItem>
              <MoveRight className='mr-2 h-4 w-4' />
              Transfer
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <UserMinus className='mr-2 h-4 w-4' />
              Deactivate
            </DropdownMenuItem>

            <DropdownMenuItem>
              <UserX className='mr-2 h-4 w-4' />
              Terminate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='mt-6 flex gap-5'>
        <div className='flex h-28 w-28 items-center justify-center rounded-full bg-muted text-5xl'>
          👤
        </div>

        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>
            {[p.firstNameEn, p.secondNameEn, p.thirdNameEn, p.familyNameEn]
              .filter(Boolean)
              .join(' ')}
          </h1>

          <div>Employee #{p.employeeNumber}</div>
          <div>{e?.positionItem.position.titleEn}</div>
          <div>{e?.positionItem.department.nameEn}</div>
          <Badge
            variant={'outline'}
            className={statusClass[e?.status ?? ''] ?? ''}
          >
            {statusLabel[e?.status ?? ''] ?? e?.status}
          </Badge>
          <div className='grid grid-cols-2 gap-x-10 gap-y-2 pt-5'>
            <div>
              <strong>Hire Date</strong>
              <br />
              {e?.hireDate}
            </div>
            <div>
              <strong>Position Control Number</strong>
              <br />
              {e?.positionItem.itemNumber}
            </div>
            <div>
              <strong>Category</strong>
              <br />
              {e?.positionItem.categoryCode}
            </div>
            <div>
              <strong>Workforce</strong>
              <br />
              {e?.positionItem.workforceCategory}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
