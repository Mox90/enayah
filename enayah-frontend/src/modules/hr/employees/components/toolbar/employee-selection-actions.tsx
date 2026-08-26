// enayah-frontend/src/modules/hr/employees/components/toolbar/employee-selection-actions.tsx

'use client'

import { useLayoutEffect, useRef } from 'react'
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

interface Props {
  selectedIds: string[]
}

export function EmployeeSelectionActions({ selectedIds }: Props) {
  const router = useRouter()

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('common')

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
          <DropdownMenuItem
            onClick={() => console.log('Export Excel', selectedIds)}
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
