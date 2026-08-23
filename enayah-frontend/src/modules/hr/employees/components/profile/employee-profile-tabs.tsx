'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLocale, useTranslations } from 'next-intl'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge as UiBadge } from '@/components/ui/badge'

import {
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  GraduationCap,
  UserRound,
} from 'lucide-react'

import PersonalTab from './tabs/personal-tab'
import EmploymentTab from './tabs/employment-tab'
import CredentialsTab from './tabs/credentials-tab'
import TrainingTab from './tabs/training-tab'
import CPDTab from './tabs/cpd-tab'

import { EmployeeProfile } from '../../types/employee-profile.types'
import { useCredentialSummary } from '../../hooks/use-employee-profile'

interface Props {
  employeeId: string
  profile: EmployeeProfile
}

const tabTriggerClass = `
  group
  after:hidden
  min-w-fit
  gap-2
  rounded-md
  px-3
  py-2.5
  text-muted-foreground
  transition-colors
  duration-200

  hover:bg-emerald-500/[0.05]
  hover:text-emerald-700

  dark:hover:bg-emerald-400/[0.06]
  dark:hover:text-emerald-300

  data-[state=active]:bg-emerald-500/[0.08]
  data-[state=active]:font-medium
  data-[state=active]:text-emerald-700

  dark:data-[state=active]:bg-emerald-400/[0.09]
  dark:data-[state=active]:text-emerald-300
`

const tabIconClass = `
  size-4
  shrink-0
  text-muted-foreground
  transition-colors

  group-hover:text-emerald-600
  dark:group-hover:text-emerald-400

  group-data-[state=active]:text-emerald-600
  dark:group-data-[state=active]:text-emerald-400
`

const tabBadgeClass = `
  h-5
  min-w-5
  rounded-full
  px-1.5
  text-[10px]
  tabular-nums
  transition-colors

  group-data-[state=active]:bg-emerald-500/10
  group-data-[state=active]:text-emerald-700

  dark:group-data-[state=active]:bg-emerald-400/10
  dark:group-data-[state=active]:text-emerald-300
`

export function EmployeeProfileTabs({ employeeId, profile }: Props) {
  const [tab, setTab] = useState('personal')

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const et = useTranslations('employees')

  const tabsListRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const contentAreaRef = useRef<HTMLDivElement>(null)

  const hasPositionedIndicator = useRef(false)

  const {
    data: profileSummary,
    isLoading: isProfileSummaryLoading,
    isError: isProfileSummaryError,
  } = useCredentialSummary(employeeId)

  const showSummary = !isProfileSummaryLoading && !isProfileSummaryError

  /*
   * --------------------------------
   * Active tab indicator
   * --------------------------------
   */
  useLayoutEffect(() => {
    const list = tabsListRef.current
    const indicator = indicatorRef.current

    if (!list || !indicator) {
      return
    }

    const activeTrigger = list.querySelector<HTMLElement>(
      '[data-state="active"]',
    )

    if (!activeTrigger) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const moveIndicator = (animate: boolean) => {
      /*
       * offsetLeft is a physical left-coordinate,
       * therefore the indicator below also uses
       * left-0 rather than start-0.
       */
      const x = activeTrigger.offsetLeft
      const width = activeTrigger.offsetWidth

      if (!animate || prefersReducedMotion) {
        gsap.set(indicator, {
          x,
          width,
          opacity: 1,
        })

        return
      }

      gsap.killTweensOf(indicator)

      gsap.to(indicator, {
        x,
        width,
        opacity: 1,
        duration: 0.42,

        /*
         * Glide past the target very slightly,
         * then settle into position.
         */
        ease: 'back.out(1.7)',
      })
    }

    moveIndicator(hasPositionedIndicator.current)

    hasPositionedIndicator.current = true

    /*
     * Keep selected tab visible on narrow
     * horizontally scrollable tab strips.
     */
    activeTrigger.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })

    const resizeObserver = new ResizeObserver(() => {
      moveIndicator(false)
    })

    resizeObserver.observe(list)
    resizeObserver.observe(activeTrigger)

    return () => {
      resizeObserver.disconnect()
    }
  }, [tab])

  /*
   * --------------------------------
   * Tab content transition
   * --------------------------------
   */
  useLayoutEffect(() => {
    const container = contentAreaRef.current

    if (!container) {
      return
    }

    const activeContent = container.querySelector<HTMLElement>(
      '[data-state="active"]',
    )

    if (!activeContent) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        activeContent,
        {
          opacity: 0,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        },
      )
    }, container)

    return () => {
      ctx.revert()
    }
  }, [tab])

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      dir={isRtl ? 'rtl' : 'ltr'}
      className='space-y-4'
    >
      {/* -------------------------------- */}
      {/* Navigation */}
      {/* -------------------------------- */}

      <div className='rounded-xl border bg-background shadow-sm'>
        <TabsList
          ref={tabsListRef}
          variant='line'
          className='relative w-full justify-start gap-1 overflow-x-auto px-2'
        >
          {/* Personal */}

          <TabsTrigger value='personal' className={tabTriggerClass}>
            <UserRound className={tabIconClass} />

            <span>{et('personal')}</span>
          </TabsTrigger>

          {/* Employment */}

          <TabsTrigger value='employment' className={tabTriggerClass}>
            <BriefcaseBusiness className={tabIconClass} />

            <span>{et('employment')}</span>
          </TabsTrigger>

          {/* Credentials */}

          <TabsTrigger value='credentials' className={tabTriggerClass}>
            <BadgeCheck className={tabIconClass} />

            <span>{et('credentials')}</span>

            {showSummary && (
              <UiBadge variant='secondary' className={tabBadgeClass}>
                {profileSummary?.credentialsCount ?? 0}
              </UiBadge>
            )}
          </TabsTrigger>

          {/* Training */}

          <TabsTrigger value='training' className={tabTriggerClass}>
            <GraduationCap className={tabIconClass} />

            <span>{et('training')}</span>

            {showSummary && (
              <UiBadge variant='secondary' className={tabBadgeClass}>
                {profileSummary?.trainingCount ?? 0}
              </UiBadge>
            )}
          </TabsTrigger>

          {/* CPD */}

          <TabsTrigger value='cpd' className={tabTriggerClass}>
            <BookOpenCheck className={tabIconClass} />

            <span>{et('cpd')}</span>

            {showSummary && (
              <UiBadge variant='secondary' className={tabBadgeClass}>
                {profileSummary?.cpdCount ?? 0}
              </UiBadge>
            )}
          </TabsTrigger>

          {/* -------------------------------- */}
          {/* GSAP Active Indicator */}
          {/* -------------------------------- */}

          <div
            ref={indicatorRef}
            aria-hidden='true'
            className='pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full bg-emerald-600 opacity-0 dark:bg-emerald-400'
          />
        </TabsList>
      </div>

      {/* -------------------------------- */}
      {/* Content */}
      {/* -------------------------------- */}

      <div ref={contentAreaRef} className={isRtl ? 'text-right' : 'text-left'}>
        <TabsContent value='personal' className='mt-0 outline-none'>
          <PersonalTab personal={profile.personal} />
        </TabsContent>

        <TabsContent value='employment' className='mt-0 outline-none'>
          <EmploymentTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value='credentials' className='mt-0 outline-none'>
          <CredentialsTab employeeId={employeeId} />
        </TabsContent>

        <TabsContent value='training' className='mt-0 outline-none'>
          <TrainingTab training={employeeId} />
        </TabsContent>

        <TabsContent value='cpd' className='mt-0 outline-none'>
          <CPDTab cpd={employeeId} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
