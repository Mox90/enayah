// enayah-frontend/src/components/layouts/topbar-breadcrumb.tsx

'use client'

import { ChevronLeft, ChevronRight, House } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { navigation } from '@/lib/navigation/navigation.config'
import { Link, usePathname } from '../../../i18n/navigation'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface BreadcrumbSeparatorProps {
  isRtl: boolean
}

const BreadcrumbSeparator = ({ isRtl }: BreadcrumbSeparatorProps) => {
  return isRtl ? (
    <ChevronLeft className='h-4 w-4 shrink-0 text-muted-foreground/60' />
  ) : (
    <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground/60' />
  )
}

function isTechnicalSegment(segment: string) {
  return UUID_PATTERN.test(segment) || /^\d+$/.test(segment)
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

const breadcrumbKeys = {
  profile: 'profile',
  personal: 'personal',
  employment: 'employment',
  contract: 'contract',
  contracts: 'contracts',
  compensation: 'compensation',
  credentials: 'credentials',
  documents: 'documents',
  history: 'history',
  edit: 'edit',
  renewal: 'renewal',
  details: 'details',
  settings: 'settings',
} as const

type BreadcrumbKey = keyof typeof breadcrumbKeys

const onboardingStepKeys = {
  personal: 'personal',
  employmentContractAssignment: 'employmentContractAssignment',
  compensation: 'compensation',
  credentials: 'credentials',
  review: 'review',
} as const

type OnboardingStepKey = keyof typeof onboardingStepKeys

const TopbarBreadcrumb = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const locale = useLocale()

  const navigationT = useTranslations('navigation')
  const breadcrumbT = useTranslations('breadcrumbs')

  const isRtl = locale === 'ar'

  const pathSegments = pathname.split('/').filter(Boolean)

  const currentNavigationItem = [...navigation]
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]

  const rootHref = currentNavigationItem?.href ?? '/dashboard'

  const rootSegments = rootHref.split('/').filter(Boolean)

  const rootLabel = currentNavigationItem
    ? navigationT(currentNavigationItem.label)
    : breadcrumbT('home')

  /*
   * Employees onboarding workspace
   *
   * /employees?mode=onboarding&step=personal
   */
  const isEmployeeOnboarding =
    pathname === '/employees' && searchParams.get('mode') === 'onboarding'

  const onboardingStep = searchParams.get('step')

  const validOnboardingStep =
    onboardingStep && onboardingStep in onboardingStepKeys
      ? (onboardingStep as OnboardingStepKey)
      : 'personal'

  /*
   * Normal path-based breadcrumbs
   */
  const childBreadcrumbs: {
    segment: string
    href: string
  }[] = []

  const accumulatedSegments = [...rootSegments]

  pathSegments.slice(rootSegments.length).forEach((segment) => {
    accumulatedSegments.push(segment)

    if (isTechnicalSegment(segment)) {
      return
    }

    childBreadcrumbs.push({
      segment,
      href: `/${accumulatedSegments.join('/')}`,
    })
  })

  const getBreadcrumbLabel = (segment: string) => {
    const key = breadcrumbKeys[segment as BreadcrumbKey]

    if (key) {
      return breadcrumbT(key)
    }

    return humanizeSegment(segment)
  }

  return (
    <nav
      aria-label={breadcrumbT('breadcrumb')}
      className='hidden min-w-0 items-center gap-1 lg:flex'
    >
      {/* MODULE HOME */}
      <Link
        href={rootHref}
        aria-label={rootLabel}
        title={rootLabel}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          'text-muted-foreground transition-colors',
          'hover:bg-muted hover:text-foreground',
          pathname === rootHref &&
            !isEmployeeOnboarding &&
            'bg-muted text-foreground',
        )}
      >
        <House className='size-5' />
      </Link>

      {/* EMPLOYEE ONBOARDING */}
      {isEmployeeOnboarding ? (
        <>
          <BreadcrumbSeparator isRtl={isRtl} />

          <Link
            href={{
              pathname: '/employees',
              query: {
                mode: 'onboarding',
                step: 'personal',
              },
            }}
            className={cn(
              'rounded-md px-2 py-1',
              'text-sm font-medium text-muted-foreground',
              'transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            {breadcrumbT('onboarding')}
          </Link>

          <BreadcrumbSeparator isRtl={isRtl} />

          <span
            aria-current='page'
            className='max-w-[240px] truncate px-2 text-sm font-semibold text-foreground'
          >
            {breadcrumbT(onboardingStepKeys[validOnboardingStep])}
          </span>
        </>
      ) : (
        childBreadcrumbs.map((breadcrumb, index) => {
          const isLast = index === childBreadcrumbs.length - 1

          return (
            <div
              key={breadcrumb.href}
              className='flex min-w-0 items-center gap-1'
            >
              <BreadcrumbSeparator isRtl={isRtl} />

              {isLast ? (
                <span
                  aria-current='page'
                  className='max-w-[220px] truncate px-2 text-sm font-semibold text-foreground'
                >
                  {getBreadcrumbLabel(breadcrumb.segment)}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className={cn(
                    'max-w-[220px] truncate rounded-md px-2 py-1',
                    'text-sm font-medium text-muted-foreground',
                    'transition-colors hover:bg-muted hover:text-foreground',
                  )}
                >
                  {getBreadcrumbLabel(breadcrumb.segment)}
                </Link>
              )}
            </div>
          )
        })
      )}
    </nav>
  )
}

export default TopbarBreadcrumb
