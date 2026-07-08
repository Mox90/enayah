// src/components/date/hijri-date-picker.tsx

'use client'

import DatePicker from 'react-multi-date-picker'
import arabic from 'react-date-object/calendars/arabic'
import arabic_ar from 'react-date-object/locales/arabic_ar'
import gregorian from 'react-date-object/calendars/gregorian'
import DateObject from 'react-date-object'

// interface Props {
//   value?: string | null
//   onChange: (value: { hijri: string; gregorian: string }) => void
// }

// export function HijriDatePicker({ value, onChange }: Props) {
//   return (
//     <DatePicker
//       value={value}
//       calendar={arabic}
//       locale={arabic_ar}
//       format='YYYY-MM-DD'
//       inputClass='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
//       onChange={(date) => {
//         if (!date) return

//         const hijriDate = date.format('YYYY-MM-DD')

//         const gregorianDate = new DateObject(date)
//           .convert(gregorian)
//           .format('YYYY-MM-DD')

//         onChange({
//           hijri: hijriDate,
//           gregorian: gregorianDate,
//         })
//       }}
//     />
//   )
// }

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

// src/components/date/hijri-date-picker.tsx

import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'

interface Props {
  value?: string | null
  onChange: (value: { hijri: string; gregorian: string }) => void
  placeholder?: string
}

export function HijriDatePicker({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
}: Props) {
  // CRITICAL: Safely parse a raw string value into a proper Hijri calendar instance for bidirectional sync
  const parsedValue = useMemo(() => {
    if (!value) return undefined
    try {
      return new DateObject({
        date: value,
        calendar: arabic,
        locale: arabic_ar,
        format: 'YYYY-MM-DD',
      })
    } catch (e) {
      return undefined
    }
  }, [value])

  return (
    <div className='relative w-full group premium-date-picker-wrapper'>
      {/* High-Definition OKLCH Native Design System Sync */}
      <style jsx global>{`
        .rmdp-container {
          width: 100% !important;
        }
        .rmdp-ep-arrow {
          background-color: var(--popover) !important;
          border: 1px solid var(--border) !important;
        }
        .rmdp-calendar {
          background-color: var(--popover) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius, 10px) !important;
          box-shadow:
            0 10px 25px -5px rgb(0 0 0 / 0.1),
            0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
          padding: 12px !important;
          font-family: var(--font-ui), sans-serif !important;
        }

        /* Premium Header Fixes for Dark and Light Modes */
        .rmdp-header {
          margin-bottom: 8px !important;
          padding: 0 4px !important;
        }
        .rmdp-header-values {
          color: var(--popover-foreground) !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
        }

        /* Arrows & Interactive Elements Navigation Containers */
        .rmdp-arrow-container {
          background-color: transparent !important;
          border-radius: calc(var(--radius) * 0.6) !important;
          transition:
            background-color 0.15s ease,
            transform 0.1s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 30px !important;
          height: 30px !important;
        }
        .rmdp-arrow-container:hover {
          background-color: var(--accent) !important;
        }
        .rmdp-arrow-container:active {
          transform: scale(0.95);
        }

        /* Core fix for invisible/white arrows using generic span targets */
        .rmdp-arrow-container .rmdp-arrow {
          border: solid var(--popover-foreground) !important;
          border-width: 0 2px 2px 0 !important;
          margin: 0 !important;
          transition: border-color 0.15s ease !important;
        }
        .rmdp-arrow-container:hover .rmdp-arrow {
          border-color: var(--accent-foreground) !important;
        }

        /* Calendar Body Overrides */
        .rmdp-week-day {
          color: var(--muted-foreground) !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          height: 32px !important;
        }
        .rmdp-day {
          height: 34px !important;
          width: 34px !important;
        }
        .rmdp-day span {
          color: var(--popover-foreground) !important;
          font-size: 0.85rem !important;
          border-radius: calc(var(--radius) * 0.6) !important;
          transition: all 0.15s ease !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
        }

        /* Hover, Active, and Selected Node State Machinery */
        .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover {
          background-color: var(--accent) !important;
          color: var(--accent-foreground) !important;
        }
        .rmdp-day.rmdp-today span {
          background-color: var(--muted) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
        }
        .rmdp-day.rmdp-selected span {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.08) !important;
        }
        .rmdp-day.rmdp-deactive span {
          color: var(--muted-foreground) !important;
          opacity: 0.35 !important;
        }
      `}</style>

      {/* Input Element Configured for Tailwind CSS v4 and RTL Padding Adjustments */}
      <DatePicker
        value={parsedValue}
        calendar={arabic}
        locale={arabic_ar}
        format='YYYY-MM-DD'
        placeholder={placeholder}
        inputClass='flex h-11 w-full rounded-xl border border-input bg-background ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs'
        onChange={(date) => {
          if (!date) return

          const hijriDate = date.format('YYYY-MM-DD')

          // const gregorianDate = new DateObject({
          //   date: date.toDate(),
          //   calendar: gregorian,
          //   format: 'YYYY-MM-DD',
          // }).format('YYYY-MM-DD')
          const gregorianDate = new DateObject(date.toDate())
            .convert(gregorian)
            .format('YYYY-MM-DD')

          onChange({
            hijri: hijriDate,
            gregorian: gregorianDate,
          })
        }}
      />

      {/* Decorative Premium Calendar Icon with bi-directional absolute position adjustments */}
      <div className='absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-200'>
        <CalendarDays className='h-4 w-4' strokeWidth={2} />
      </div>
    </div>
  )
}
