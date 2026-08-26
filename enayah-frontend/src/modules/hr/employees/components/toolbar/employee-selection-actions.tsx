// enayah-frontend/src/modules/hr/employees/components/toolbar/employee-selection-actions.tsx

'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  ChevronDown,
  Download,
  Eye,
  File,
  FilePenLine,
  FileSpreadsheet,
  FileText,
  Mail,
  MoreHorizontal,
  Printer,
  UserMinus,
  UserRoundCog,
  UserX,
} from 'lucide-react'
import { EmployeeDirectoryRow } from '../../types/employee-directory.types'

interface Props {
  selectedIds: string[]
  selectedEmployees: EmployeeDirectoryRow[]
}

export function EmployeeSelectionActions({
  selectedIds,
  selectedEmployees,
}: Props) {
  const router = useRouter()

  const locale = useLocale()
  const isRtl = locale === 'ar'
  const t = useTranslations('common')
  const et = useTranslations('employees')

  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const hasSelection = selectedIds.length > 0

  /*
   * Compact mobile count.
   *
   * 1-9  -> 1 ... 9
   * 10+  -> +9
   */
  const compactSelectedCount =
    selectedIds.length > 9 ? '+9' : selectedIds.length

  /*
   * Smooth sequential slide-in.
   *
   * LTR:
   * Selected → Export → Print → Actions
   *
   * RTL:
   * slides from the opposite side.
   */
  useLayoutEffect(() => {
    if (!hasSelection || !actionsRef.current) {
      return
    }

    const container = actionsRef.current

    const actions = container.querySelectorAll<HTMLElement>(
      '[data-selection-action]',
    )

    if (!actions.length) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      gsap.set(actions, {
        opacity: 1,
        x: 0,
      })

      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        actions,
        {
          opacity: 0,
          x: isRtl ? 24 : -24,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.07,
          clearProps: 'opacity,transform',
        },
      )
    }, container)

    return () => {
      ctx.revert()
    }
  }, [hasSelection, isRtl])

  const handleExportExcel = async () => {
    if (!selectedEmployees.length || isExportingExcel) {
      return
    }

    try {
      setIsExportingExcel(true)

      /*
       * Browser-only Excel implementation.
       *
       * Dynamically imported so the Excel library is only loaded
       * when the user actually requests an export.
       */
      const { default: writeExcelFile } =
        await import('write-excel-file/browser')

      const align = isRtl ? ('right' as const) : ('left' as const)

      const getHeader = (value: string) => ({
        value,
        fontWeight: 'bold' as const,
        align,
      })

      const getFullName = (employee: EmployeeDirectoryRow) => {
        const englishName = [
          employee.firstNameEn,
          employee.secondNameEn,
          employee.thirdNameEn,
          employee.familyNameEn,
        ]
          .filter(Boolean)
          .join(' ')

        const arabicName = [
          employee.firstNameAr,
          employee.secondNameAr,
          employee.thirdNameAr,
          employee.familyNameAr,
        ]
          .filter(Boolean)
          .join(' ')

        return isRtl ? arabicName || englishName : englishName
      }

      const getDepartment = (employee: EmployeeDirectoryRow) => {
        if (isRtl) {
          return employee.departmentNameAr ?? employee.departmentNameEn ?? ''
        }

        return employee.departmentNameEn ?? ''
      }

      const getPosition = (employee: EmployeeDirectoryRow) => {
        if (isRtl) {
          return employee.positionTitleAr ?? employee.positionTitleEn ?? ''
        }

        return employee.positionTitleEn ?? ''
      }

      const getNationality = (employee: EmployeeDirectoryRow) => {
        if (isRtl) {
          return employee.nationalityAr ?? employee.nationalityEn ?? ''
        }

        return employee.nationalityEn ?? ''
      }

      const getGender = (gender: string | null | undefined) => {
        switch (gender) {
          case 'male':
            return et('male')

          case 'female':
            return et('female')

          default:
            return ''
        }
      }

      const getStaffCategory = (staffCategory: string | null | undefined) => {
        switch (staffCategory) {
          case 'civilian':
            return et('staffCategories.civilian')

          case 'military':
            return et('staffCategories.military')

          case 'contractual':
            return et('staffCategories.contractual')

          default:
            return staffCategory ?? ''
        }
      }

      const getEmploymentStatus = (status: string | null | undefined) => {
        switch (status) {
          case 'active':
            return et('employmentStatuses.active')

          case 'on_leave':
            return et('employmentStatuses.onLeave')

          case 'suspended':
            return et('employmentStatuses.suspended')

          case 'ended':
            return et('employmentStatuses.ended')

          default:
            return status ?? ''
        }
      }

      const columns = [
        {
          header: getHeader(et('employeeNumber')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: toExcelNumber(employee.employeeNumber),
            type: Number,
            align,
          }),
          width: 18,
        },

        {
          header: getHeader(et('fullName')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getFullName(employee),
            type: String,
            align,
          }),
          width: 36,
        },

        {
          header: getHeader(et('department')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getDepartment(employee),
            type: String,
            align,
          }),
          width: 30,
        },

        {
          header: getHeader(et('position')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getPosition(employee),
            type: String,
            align,
          }),
          width: 30,
        },

        {
          header: getHeader(et('pcn')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: employee.pcn ?? '',
            type: String,
            align,
          }),
          width: 16,
        },

        {
          header: getHeader(et('category')),

          cell: (employee: EmployeeDirectoryRow) => ({
            value: toExcelNumber(employee.categoryCode),
            type: Number,
            format: '0',
            align,
          }),

          width: 14,
        },

        {
          header: getHeader(et('gender')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getGender(employee.gender),
            type: String,
            align,
          }),
          width: 14,
        },

        {
          header: getHeader(et('nationality')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getNationality(employee),
            type: String,
            align,
          }),
          width: 22,
        },

        {
          header: getHeader(et('hireDate')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: employee.hireDate ?? '',
            type: String,
            align,
          }),
          width: 16,
        },

        {
          header: getHeader(et('staffCategories.staffCategory')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getStaffCategory(employee.staffCategory),
            type: String,
            align,
          }),
          width: 20,
        },

        {
          header: getHeader(et('iqamaNumber')),

          cell: (employee: EmployeeDirectoryRow) => ({
            value: toExcelNumber(employee.iqamaNumber),
            type: Number,
            format: '0',
            align,
          }),

          width: 20,
        },

        {
          header: getHeader(et('status')),
          cell: (employee: EmployeeDirectoryRow) => ({
            value: getEmploymentStatus(employee.employmentStatus),
            type: String,
            align,
          }),
          width: 18,
        },
      ]

      const workbook = await writeExcelFile(selectedEmployees, {
        columns,
        sheet: isRtl ? 'الموظفون' : 'Employees',
        rightToLeft: isRtl,
        stickyRowsCount: 1,
        showGridLines: true,
      })

      const now = new Date()

      const dateStamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')

      await workbook.toFile(`employees-${dateStamp}.xlsx`)
    } catch (error) {
      console.error('Failed to export selected employees to Excel:', error)
    } finally {
      setIsExportingExcel(false)
    }
  }

  const toExcelNumber = (
    value: string | number | null | undefined,
  ): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : undefined
  }

  /*
   * Hooks must remain above this return.
   */
  if (!hasSelection) {
    return null
  }

  const singleSelected = selectedIds.length === 1

  return (
    <div
      ref={actionsRef}
      dir={isRtl ? 'rtl' : 'ltr'}
      className='flex min-w-0 items-center gap-2'
    >
      {/* -------------------------------- */}
      {/* Selected count */}
      {/* -------------------------------- */}

      <div
        data-selection-action
        title={`${selectedIds.length} ${t('selected')}`}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center',
          'rounded-xl border bg-muted/40',
          'text-sm font-semibold tabular-nums',
          'sm:h-10 sm:w-auto sm:px-3 sm:font-medium',
        )}
      >
        {/* Mobile */}

        <span className='sm:hidden'>{compactSelectedCount}</span>

        {/* Tablet / Desktop */}

        <span className='hidden whitespace-nowrap sm:inline'>
          {selectedIds.length} {t('selected')}
        </span>
      </div>

      {/* -------------------------------- */}
      {/* Export */}
      {/* -------------------------------- */}

      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            data-selection-action
            variant='outline'
            aria-label={t('export')}
            className={cn(
              'size-10 shrink-0 rounded-xl p-0',
              'sm:h-10 sm:w-auto sm:px-4',
              'hover:text-green-400',
            )}
          >
            <Download className='size-4 shrink-0' />

            <span className='hidden sm:ms-2 sm:inline'>{t('export')}</span>

            <ChevronDown className='hidden size-4 opacity-60 sm:ms-2 sm:block' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className='w-44'>
          {/* <DropdownMenuItem
            onClick={() => console.log('Export Excel', selectedIds)}
            className='hover:text-emerald-400'
          >
            <FileSpreadsheet className='me-2 size-4' />

            {t('excel')}
          </DropdownMenuItem> */}
          <DropdownMenuItem
            disabled={isExportingExcel || selectedEmployees.length === 0}
            onSelect={() => {
              void handleExportExcel()
            }}
            className='hover:text-emerald-400'
          >
            <FileSpreadsheet className='me-2 size-4' />

            {t('excel')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Export CSV', selectedIds)}
          >
            <File className='me-2 size-4' />

            {t('csv')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Export PDF', selectedIds)}
          >
            <FileText className='me-2 size-4' />

            {t('pdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* -------------------------------- */}
      {/* Print */}
      {/* -------------------------------- */}

      <Button
        data-selection-action
        variant='outline'
        aria-label={t('print')}
        className={cn(
          'size-10 shrink-0 rounded-xl p-0',
          'sm:h-10 sm:w-auto sm:px-4',
          'hover:text-green-400',
        )}
        onClick={() => console.log('Print', selectedIds)}
      >
        <Printer className='size-4 shrink-0' />

        <span className='hidden sm:ms-2 sm:inline'>{t('print')}</span>
      </Button>

      {/* -------------------------------- */}
      {/* More actions */}
      {/* -------------------------------- */}

      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            data-selection-action
            variant='outline'
            aria-label={t('actions')}
            className={cn(
              'size-10 shrink-0 rounded-xl p-0',
              'sm:h-10 sm:w-auto sm:px-4',
              'hover:text-green-400',
            )}
          >
            <MoreHorizontal className='size-4 shrink-0' />

            <span className='hidden sm:ms-2 sm:inline'>{t('actions')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-56'>
          {singleSelected && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/${locale}/employees/${selectedIds[0]}/profile`)
                }
              >
                <Eye className='me-2 size-4' />

                {t('profile')}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/${locale}/contracts/new?employeeId=${selectedIds[0]}`,
                  )
                }
              >
                <FilePenLine className='me-2 size-4' />

                {t('amendContract')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={() => console.log('Assign Training', selectedIds)}
          >
            <UserRoundCog className='me-2 size-4' />

            {t('assignTraining')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Send Email', selectedIds)}
          >
            <Mail className='me-2 size-4' />

            {t('sendEmail')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => console.log('Deactivate', selectedIds)}
          >
            <UserMinus className='me-2 size-4' />

            {t('deactivate')}
          </DropdownMenuItem>

          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => console.log('Terminate', selectedIds)}
          >
            <UserX className='me-2 size-4' />

            {t('terminate')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
