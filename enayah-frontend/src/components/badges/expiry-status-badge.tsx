// enayah-frontend/src/components/badges/expiry-status-badge.tsx

'use client'

import {
  differenceInCalendarDays,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { AlertOctagon, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

import { StatusBadge } from '@/components/badges/status-badge'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/utils/utilities'

export type ExpiryBadgeStatus =
  | 'expiry_valid'
  | 'expiry_61_90'
  | 'expiry_31_60'
  | 'expiry_2_30'
  | 'expiry_tomorrow'
  | 'expiry_expired'
  | 'expiry_missing'
  | 'expiry_invalid'

export interface ExpiryStatusResult {
  status: ExpiryBadgeStatus
  daysRemaining: number | null
}

interface ExpiryStatusBadgeProps {
  expiryDate?: string | null
  className?: string
  showMissingDate?: boolean
  showAttentionPulse?: boolean
  pulseOnParentHover?: boolean
  pulseOnInView?: boolean
  referenceDate?: Date
}

const urgentAttentionClass = [
  'motion-safe:animate-ping',
  'motion-safe:[animation-iteration-count:3]',
  'motion-safe:[animation-fill-mode:forwards]',
  'motion-reduce:hidden',
].join(' ')

export function getExpiryBadgeStatus(
  expiryDate?: string | null,
  referenceDate = new Date(),
): ExpiryStatusResult {
  if (!expiryDate) {
    return { status: 'expiry_missing', daysRemaining: null }
  }

  const parsedExpiryDate = parseISO(expiryDate)

  if (!isValid(parsedExpiryDate)) {
    return { status: 'expiry_invalid', daysRemaining: null }
  }

  const daysRemaining = differenceInCalendarDays(
    startOfDay(parsedExpiryDate),
    startOfDay(referenceDate),
  )

  if (daysRemaining <= 0) return { status: 'expiry_expired', daysRemaining }
  if (daysRemaining === 1) return { status: 'expiry_tomorrow', daysRemaining }
  if (daysRemaining <= 30) return { status: 'expiry_2_30', daysRemaining }
  if (daysRemaining <= 60) return { status: 'expiry_31_60', daysRemaining }
  if (daysRemaining <= 90) return { status: 'expiry_61_90', daysRemaining }

  return { status: 'expiry_valid', daysRemaining }
}

export function ExpiryStatusBadge({
  expiryDate,
  className,
  showMissingDate = false,
  showAttentionPulse = false,
  pulseOnParentHover = false,
  pulseOnInView = false,
  referenceDate,
}: ExpiryStatusBadgeProps) {
  const locale = useLocale()
  const ct = useTranslations('common')
  const isRtl = locale === 'ar'

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  // Track midnight boundary updates when no explicit referenceDate is provided
  const [today, setToday] = useState<Date>(() => referenceDate ?? new Date())

  // If referenceDate prop changes, keep state synchronized safely
  const effectiveReferenceDate = referenceDate ?? today

  useEffect(() => {
    if (referenceDate) return

    const checkMidnight = () => {
      const now = new Date()
      setToday((prev) => {
        if (prev.toDateString() !== now.toDateString()) {
          return now
        }
        return prev
      })
    }

    const interval = setInterval(checkMidnight, 60 * 1000)
    return () => clearInterval(interval)
  }, [referenceDate])

  const { status, daysRemaining } = getExpiryBadgeStatus(
    expiryDate,
    effectiveReferenceDate,
  )

  const isAttentionStatus =
    status === 'expiry_expired' ||
    status === 'expiry_tomorrow' ||
    status === 'expiry_2_30'

  useEffect(() => {
    if (!pulseOnInView || !isAttentionStatus || !wrapperRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.6 },
    )

    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [pulseOnInView, isAttentionStatus])

  if (status === 'expiry_missing' && !showMissingDate) {
    return null
  }

  const displayedDays =
    daysRemaining === null
      ? null
      : isRtl
        ? toPersianDigits(daysRemaining)
        : daysRemaining

  const label = (() => {
    switch (status) {
      case 'expiry_valid':
        return ct('valid')
      case 'expiry_61_90':
      case 'expiry_31_60':
      case 'expiry_2_30':
        if (displayedDays === null) return ct('invalidExpiryDate')
        return ct('expiresInDays', { days: displayedDays })
      case 'expiry_tomorrow':
        return ct('expiresTomorrow')
      case 'expiry_expired':
        return ct('expired')
      case 'expiry_missing':
        return ct('noExpiryDate')
      case 'expiry_invalid':
        return ct('invalidExpiryDate')
    }
  })()

  const IconComponent = (() => {
    switch (status) {
      case 'expiry_expired':
        return AlertOctagon
      case 'expiry_tomorrow':
      case 'expiry_2_30':
        return AlertTriangle
      case 'expiry_61_90':
      case 'expiry_31_60':
        return Clock
      case 'expiry_valid':
        return CheckCircle
      default:
        return null
    }
  })()

  const badge = (
    <StatusBadge
      status={status}
      label={
        <>
          {IconComponent && (
            <IconComponent
              className='h-3.5 w-3.5 shrink-0'
              aria-hidden='true'
            />
          )}
          <span>{label}</span>
        </>
      }
      className={cn('relative z-10 flex items-center gap-1.5', className)}
    />
  )

  if (!isAttentionStatus) {
    return badge
  }

  const shouldPulseInView = pulseOnInView && isAttentionStatus && isInView
  const pulseBaseClass =
    'pointer-events-none absolute inset-0 z-0 rounded-full bg-red-500/50'

  return (
    <div ref={wrapperRef} className='relative isolate inline-flex'>
      {(showAttentionPulse && !pulseOnInView) || shouldPulseInView ? (
        <span
          aria-hidden='true'
          className={cn(pulseBaseClass, urgentAttentionClass)}
        />
      ) : null}

      {pulseOnParentHover && (
        <span
          aria-hidden='true'
          className={cn(
            pulseBaseClass,
            'hidden group-hover/credential:block',
            'motion-safe:group-hover/credential:animate-ping',
            'motion-safe:group-hover/credential:[animation-iteration-count:3]',
            'motion-safe:group-hover/credential:[animation-fill-mode:forwards]',
            'motion-reduce:hidden',
          )}
        />
      )}

      {badge}
    </div>
  )
}

// 'use client'

// import {
//   differenceInCalendarDays,
//   isValid,
//   parseISO,
//   startOfDay,
// } from 'date-fns'
// import { useLocale, useTranslations } from 'next-intl'

// import { StatusBadge } from '@/components/badges/status-badge'
// import { cn } from '@/lib/utils'
// import { toPersianDigits } from '@/utils/utilities'
// import { useEffect, useRef, useState } from 'react'

// export type ExpiryBadgeStatus =
//   | 'expiry_valid'
//   | 'expiry_61_90'
//   | 'expiry_31_60'
//   | 'expiry_2_30'
//   | 'expiry_tomorrow'
//   | 'expiry_expired'
//   | 'expiry_missing'
//   | 'expiry_invalid'

// export interface ExpiryStatusResult {
//   status: ExpiryBadgeStatus
//   daysRemaining: number | null
// }

// interface ExpiryStatusBadgeProps {
//   expiryDate?: string | null
//   className?: string
//   showMissingDate?: boolean
//   showAttentionPulse?: boolean
//   pulseOnParentHover?: boolean
//   pulseOnInView?: boolean
//   referenceDate?: Date
// }

// const urgentAttentionClass = [
//   'motion-safe:animate-ping',
//   'motion-safe:[animation-iteration-count:3]',
//   'motion-safe:[animation-fill-mode:forwards]',
//   'motion-reduce:hidden',
// ].join(' ')

// export function getExpiryBadgeStatus(
//   expiryDate?: string | null,
//   referenceDate = new Date(),
// ): ExpiryStatusResult {
//   if (!expiryDate) {
//     return {
//       status: 'expiry_missing',
//       daysRemaining: null,
//     }
//   }

//   const parsedExpiryDate = parseISO(expiryDate)

//   if (!isValid(parsedExpiryDate)) {
//     return {
//       status: 'expiry_invalid',
//       daysRemaining: null,
//     }
//   }

//   const daysRemaining = differenceInCalendarDays(
//     startOfDay(parsedExpiryDate),
//     startOfDay(referenceDate),
//   )

//   if (daysRemaining <= 0) {
//     return {
//       status: 'expiry_expired',
//       daysRemaining,
//     }
//   }

//   if (daysRemaining === 1) {
//     return {
//       status: 'expiry_tomorrow',
//       daysRemaining,
//     }
//   }

//   if (daysRemaining <= 30) {
//     return {
//       status: 'expiry_2_30',
//       daysRemaining,
//     }
//   }

//   if (daysRemaining <= 60) {
//     return {
//       status: 'expiry_31_60',
//       daysRemaining,
//     }
//   }

//   if (daysRemaining <= 90) {
//     return {
//       status: 'expiry_61_90',
//       daysRemaining,
//     }
//   }

//   return {
//     status: 'expiry_valid',
//     daysRemaining,
//   }
// }

// export function ExpiryStatusBadge({
//   expiryDate,
//   className,
//   showMissingDate = false,
//   showAttentionPulse = false,
//   pulseOnParentHover = false,
//   pulseOnInView = false,
//   referenceDate,
// }: ExpiryStatusBadgeProps) {
//   const locale = useLocale()
//   const ct = useTranslations('common')

//   const isRtl = locale === 'ar'

//   const wrapperRef = useRef<HTMLDivElement>(null)
//   const [isInView, setIsInView] = useState(false)

//   const { status, daysRemaining } = getExpiryBadgeStatus(
//     expiryDate,
//     referenceDate,
//   )

//   const isAttentionStatus =
//     status === 'expiry_expired' ||
//     status === 'expiry_tomorrow' ||
//     status === 'expiry_2_30'

//   useEffect(() => {
//     if (!pulseOnInView || !isAttentionStatus) {
//       return
//     }

//     const element = wrapperRef.current

//     if (!element) {
//       return
//     }

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         setIsInView(entry.isIntersecting)
//       },
//       {
//         threshold: 0.6,
//       },
//     )

//     observer.observe(element)

//     return () => {
//       observer.disconnect()
//     }
//   }, [pulseOnInView, isAttentionStatus])

//   if (status === 'expiry_missing' && !showMissingDate) {
//     return null
//   }

//   const displayedDays =
//     daysRemaining === null
//       ? null
//       : isRtl
//         ? toPersianDigits(daysRemaining)
//         : daysRemaining

//   const label = (() => {
//     switch (status) {
//       case 'expiry_valid':
//         return ct('valid')

//       case 'expiry_61_90':
//       case 'expiry_31_60':
//       case 'expiry_2_30':
//         if (displayedDays === null) {
//           return ct('invalidExpiryDate')
//         }

//         return ct('expiresInDays', {
//           days: displayedDays,
//         })

//       case 'expiry_tomorrow':
//         return ct('expiresTomorrow')

//       case 'expiry_expired':
//         return ct('expired')

//       case 'expiry_missing':
//         return ct('noExpiryDate')

//       case 'expiry_invalid':
//         return ct('invalidExpiryDate')
//     }
//   })()

//   const icon = (() => {
//     switch (status) {
//       case 'expiry_expired':
//         return '🚨'

//       case 'expiry_tomorrow':
//       case 'expiry_2_30':
//         return '⚠️'

//       case 'expiry_61_90':
//         return '⏰'

//       default:
//         return null
//     }
//   })()

//   const badge = (
//     <StatusBadge
//       status={status}
//       label={
//         <>
//           {icon && <span aria-hidden='true'>{icon}</span>}
//           <span>{label}</span>
//         </>
//       }
//       className={cn('relative z-10', className)}
//     />
//   )

//   if (!isAttentionStatus) {
//     return badge
//   }

//   const shouldPulseInView = pulseOnInView && isAttentionStatus && isInView

//   const pulseBaseClass =
//     'pointer-events-none absolute inset-0 z-0 rounded-full bg-red-500/50'

//   return (
//     <div ref={wrapperRef} className='relative isolate inline-flex'>
//       {/* Pulse once when initially rendered */}
//       {showAttentionPulse && !pulseOnInView && (
//         <span
//           aria-hidden='true'
//           className={cn(pulseBaseClass, urgentAttentionClass)}
//         />
//       )}

//       {/* Pulse whenever the badge enters the viewport */}
//       {shouldPulseInView && (
//         <span
//           aria-hidden='true'
//           className={cn(pulseBaseClass, urgentAttentionClass)}
//         />
//       )}

//       {/* Pulse when the parent credential card is hovered */}
//       {pulseOnParentHover && (
//         <span
//           aria-hidden='true'
//           className={cn(
//             pulseBaseClass,
//             'hidden',
//             'group-hover/credential:block',
//             'motion-safe:group-hover/credential:animate-ping',
//             'motion-safe:group-hover/credential:[animation-iteration-count:3]',
//             'motion-safe:group-hover/credential:[animation-fill-mode:forwards]',
//             'motion-reduce:hidden',
//           )}
//         />
//       )}

//       {badge}
//     </div>
//   )
// }
