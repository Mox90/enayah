'use client'

import { ColumnDef } from '@tanstack/react-table'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'
import { useLocale, useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/tables'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/badges/status-badge'

export type EmploymentStatus =
  | 'active'
  | 'terminated'
  | 'resigned'
  | 'eoc'
  | 'transferred'
  | 'retired'
  | 'on_leave'
  | 'suspended'
  | 'deceased'

export type EmploymentStatusStyle = {
  //badgeClassName: string
  dotClassName: string
  rowClassName: string
}

export const employmentStatusStyles = {
  active: {
    dotClassName: 'bg-emerald-500 dark:bg-emerald-400',
    rowClassName: '',
  },

  terminated: {
    dotClassName: 'bg-rose-500 dark:bg-rose-400',
    rowClassName:
      'bg-rose-50/35 hover:bg-rose-50/60 dark:bg-rose-950/10 dark:hover:bg-rose-950/20',
  },

  resigned: {
    dotClassName: 'bg-orange-500 dark:bg-orange-400',
    rowClassName:
      'bg-orange-50/30 hover:bg-orange-50/55 dark:bg-orange-950/10 dark:hover:bg-orange-950/20',
  },

  eoc: {
    dotClassName: 'bg-amber-500 dark:bg-amber-400',
    rowClassName:
      'bg-amber-50/30 hover:bg-amber-50/55 dark:bg-amber-950/10 dark:hover:bg-amber-950/20',
  },

  transferred: {
    dotClassName: 'bg-cyan-500 dark:bg-cyan-400',
    rowClassName:
      'bg-cyan-50/25 hover:bg-cyan-50/50 dark:bg-cyan-950/10 dark:hover:bg-cyan-950/20',
  },

  retired: {
    dotClassName: 'bg-violet-500 dark:bg-violet-400',
    rowClassName:
      'bg-violet-50/25 hover:bg-violet-50/50 dark:bg-violet-950/10 dark:hover:bg-violet-950/20',
  },

  on_leave: {
    dotClassName: 'bg-blue-500 dark:bg-blue-400',
    rowClassName:
      'bg-blue-50/30 hover:bg-blue-50/55 dark:bg-blue-950/10 dark:hover:bg-blue-950/20',
  },

  suspended: {
    dotClassName: 'bg-yellow-500 dark:bg-yellow-400',
    rowClassName:
      'bg-yellow-50/45 hover:bg-yellow-50/70 dark:bg-yellow-950/15 dark:hover:bg-yellow-950/25',
  },

  deceased: {
    dotClassName: 'bg-slate-500 dark:bg-slate-400',
    rowClassName:
      'bg-slate-100/50 hover:bg-slate-100/75 dark:bg-slate-900/25 dark:hover:bg-slate-900/40',
  },
} satisfies Record<EmploymentStatus, EmploymentStatusStyle>

export function useEmployeeColumns(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): ColumnDef<EmployeeDirectoryRow>[] {
  const t = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const employmentStatusLabels: Record<EmploymentStatus, string> = {
    active: t('employmentStatuses.active'),
    terminated: t('employmentStatuses.terminated'),
    resigned: t('employmentStatuses.resigned'),
    eoc: t('employmentStatuses.eoc'),
    transferred: t('employmentStatuses.transferred'),
    retired: t('employmentStatuses.retired'),
    on_leave: t('employmentStatuses.onLeave'),
    suspended: t('employmentStatuses.suspended'),
    deceased: t('employmentStatuses.deceased'),
  }

  return [
    {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },

    {
      accessorKey: 'employeeNumber',
      meta: {
        label: t('employeeNumber'),
      },

      header: ({ column }) => (
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <DataTableColumnHeader
            column={column}
            title={t('employeeNumber')}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      ),

      cell: ({ row }) => {
        const employeeNumber = row.original.employeeNumber
        const status = row.original.employmentStatus as
          | EmploymentStatus
          | null
          | undefined

        const config =
          status && status in employmentStatusStyles
            ? employmentStatusStyles[status]
            : null

        return (
          <div className='inline-flex items-center gap-2 whitespace-nowrap'>
            {config && (
              <span className='relative flex size-2 shrink-0'>
                {status === 'active' && (
                  <span
                    aria-hidden='true'
                    className={cn(
                      'absolute inline-flex size-full rounded-full opacity-30',
                      config.dotClassName,
                    )}
                  />
                )}

                <span
                  aria-hidden='true'
                  className={cn(
                    'relative inline-flex size-2 rounded-full',
                    'ring-2 ring-background',
                    config.dotClassName,
                  )}
                />
              </span>
            )}

            <span className='font-medium tabular-nums text-foreground'>
              {isRtl ? toPersianDigits(employeeNumber) : employeeNumber}
            </span>
          </div>
        )
      },
    },

    {
      id: 'fullName',
      meta: {
        label: t('fullName'),
      },
      header: t('fullName'),
      cell: ({ row }) => {
        const e = row.original
        const name = isRtl
          ? [e.firstNameAr, e.secondNameAr, e.thirdNameAr, e.familyNameAr]
          : [e.firstNameEn, e.secondNameEn, e.thirdNameEn, e.familyNameEn]
        return name.filter(Boolean).join(' ')
      },
    },

    {
      //accessorKey: 'departmentNameEn',
      accessorFn: (row) =>
        isRtl
          ? (row.departmentNameAr ?? row.departmentNameEn)
          : row.departmentNameEn,
      meta: {
        label: t('department'),
      },
      header: t('department'),
    },

    {
      //accessorKey: 'positionTitleEn',
      accessorFn: (row) =>
        isRtl
          ? (row.positionTitleAr ?? row.positionTitleEn)
          : row.positionTitleEn,
      meta: {
        label: t('position'),
      },
      header: t('position'),
    },

    {
      accessorKey: 'pcn',
      meta: {
        label: t('pcn'),
      },
      header: t('pcn'),
    },

    {
      accessorKey: 'categoryCode',
      meta: {
        label: t('category'),
      },
      header: t('category'),
      cell: ({ row }) => (
        <Badge variant='secondary'>
          {/* {row.original.categoryCode !== null
            ? row.original.categoryCode
            : 'N/A'} */}
          {row.original.categoryCode !== null
            ? isRtl
              ? toPersianDigits(row.original.categoryCode)
              : row.original.categoryCode
            : '-'}
        </Badge>
      ),
    },

    {
      accessorKey: 'gender',
      meta: {
        label: t('gender'),
      },
      header: t('gender'),
      cell: ({ row }) => {
        const gender = row.original.gender

        const genderClass: Record<string, string> = {
          male: 'bg-blue-100 text-blue-700 border-blue-200',
          female: 'bg-pink-100 text-pink-700 border-pink-200',
        }

        return (
          <Badge variant='outline' className={genderClass[gender] ?? ''}>
            {gender === 'male' ? t('male') : t('female')}
          </Badge>
        )
      },
    },

    {
      //accessorKey: 'nationalityEn',
      accessorFn: (row) =>
        isRtl ? (row.nationalityAr ?? row.nationalityEn) : row.nationalityEn,
      meta: {
        label: t('nationality'),
      },
      header: t('nationality'),
    },

    {
      accessorKey: 'hireDate',
      meta: {
        label: t('hireDate'),
      },
      header: t('hireDate'),
      // cell: ({ row }) =>
      //   row.original.hireDate ? format(new Date(row.original.hireDate), 'dd-MMM-yyyy')
      //     : '-',
      cell: ({ row }) => {
        const raw = row.original.hireDate
        if (!raw) return '-'
        const parsed = new Date(raw)
        return Number.isNaN(parsed.getTime())
          ? '-'
          : isRtl
            ? toArabic(String(parsed), 1)
            : format(parsed, 'dd-MMM-yyyy')
      },
    },

    // {
    //   accessorKey: 'employmentStatus',
    //   meta: {
    //     label: t('status'),
    //   },
    //   header: t('status'),

    //   cell: ({ row }) => {
    //     const status = row.original.employmentStatus as
    //       | EmploymentStatus
    //       | null
    //       | undefined

    //     if (!status || !(status in employmentStatusStyles)) {
    //       return (
    //         <Badge
    //           variant='outline'
    //           className='min-w-[7rem] justify-center rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
    //         >
    //           -
    //         </Badge>
    //       )
    //     }

    //     const config = employmentStatusStyles[status]

    //     return (
    //       <Badge
    //         variant='outline'
    //         className={cn(
    //           'min-w-28 justify-center gap-1.5 whitespace-nowrap rounded-full',
    //           'px-2.5 py-1 text-xs font-semibold',
    //           'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
    //           'ring-1 ring-inset',
    //           config.badgeClassName,
    //         )}
    //       >
    //         <span>{employmentStatusLabels[status]}</span>
    //       </Badge>
    //     )
    //   },
    // },
    {
      accessorKey: 'employmentStatus',
      meta: {
        label: t('status'),
      },
      header: t('status'),

      cell: ({ row }) => {
        const status = row.original.employmentStatus as
          | EmploymentStatus
          | null
          | undefined

        const label =
          status && status in employmentStatusLabels
            ? employmentStatusLabels[status]
            : undefined

        return (
          <StatusBadge status={status} label={label} className='min-w-28' />
        )
      },
    },
  ]
}
