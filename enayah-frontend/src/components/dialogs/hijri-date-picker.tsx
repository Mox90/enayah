// enayah-frontend/src/components/date/hijri-date-picker.tsx

'use client'

import DatePicker from 'react-multi-date-picker'
import arabic from 'react-date-object/calendars/arabic'
import arabic_ar from 'react-date-object/locales/arabic_ar'
import gregorian from 'react-date-object/calendars/gregorian'
import DateObject from 'react-date-object'

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
  placeholder = 'YYYY/MM/DD',
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
      console.log(e)
      return undefined
    }
  }, [value])

  return (
    <div className='relative w-full group premium-date-picker-wrapper'>
      {/* High-Definition OKLCH Native Design System Sync */}

      <style jsx global>{`
        .premium-date-picker-wrapper .rmdp-container {
          width: 100% !important;
        }

        /*
   * Main popup wrapper.
   * react-multi-date-picker applies className to .rmdp-wrapper.
   */
        .nafh-hijri-calendar.rmdp-wrapper {
          background-color: var(--popover) !important;
          color: var(--popover-foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius, 10px) !important;
          box-shadow:
            0 10px 25px -5px rgb(0 0 0 / 0.25),
            0 8px 10px -6px rgb(0 0 0 / 0.2) !important;
          font-family: var(--font-ui), sans-serif !important;
        }

        /*
   * These are separate panels opened when the user clicks
   * the month or year in the header.
   */
        .nafh-hijri-calendar .rmdp-calendar,
        .nafh-hijri-calendar .rmdp-month-picker,
        .nafh-hijri-calendar .rmdp-year-picker {
          background-color: var(--popover) !important;
          color: var(--popover-foreground) !important;
        }

        .nafh-hijri-calendar .rmdp-calendar {
          padding: 12px !important;
        }

        /*
   * Month and year rows.
   */
        .nafh-hijri-calendar .rmdp-ym {
          background-color: transparent !important;
        }

        .nafh-hijri-calendar .rmdp-ym .rmdp-day span {
          color: var(--popover-foreground) !important;
        }

        /* Header */
        .nafh-hijri-calendar .rmdp-header {
          margin-bottom: 8px !important;
          padding: 0 4px !important;
        }

        .nafh-hijri-calendar .rmdp-header-values {
          color: var(--popover-foreground) !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
        }

        /* Navigation buttons */
        .nafh-hijri-calendar .rmdp-arrow-container {
          display: flex !important;
          width: 30px !important;
          height: 30px !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: transparent !important;
          border-radius: calc(var(--radius) * 0.6) !important;
          transition:
            background-color 0.15s ease,
            transform 0.1s ease !important;
        }

        .nafh-hijri-calendar .rmdp-arrow-container:hover {
          background-color: var(--accent) !important;
        }

        .nafh-hijri-calendar .rmdp-arrow-container:active {
          transform: scale(0.95);
        }

        .nafh-hijri-calendar .rmdp-arrow-container .rmdp-arrow {
          margin: 0 !important;
          border: solid var(--popover-foreground) !important;
          border-width: 0 2px 2px 0 !important;
        }

        .nafh-hijri-calendar .rmdp-arrow-container:hover .rmdp-arrow {
          border-color: var(--accent-foreground) !important;
        }

        /* Popup pointer/triangle */
        .rmdp-container .nafh-hijri-calendar.ep-arrow::after {
          background-color: var(--popover) !important;
        }

        .rmdp-container .nafh-hijri-calendar.ep-arrow[direction='top'] {
          border-bottom-color: var(--border) !important;
        }

        .rmdp-container .nafh-hijri-calendar.ep-arrow[direction='bottom'] {
          border-top-color: var(--border) !important;
        }

        .rmdp-container .nafh-hijri-calendar.ep-arrow[direction='left'] {
          border-right-color: var(--border) !important;
        }

        .rmdp-container .nafh-hijri-calendar.ep-arrow[direction='right'] {
          border-left-color: var(--border) !important;
        }

        /* Weekday headings */
        .nafh-hijri-calendar .rmdp-week-day {
          height: 32px !important;
          color: var(--muted-foreground) !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
        }

        /* Days, months and years all use rmdp-day */
        .nafh-hijri-calendar .rmdp-day {
          width: 34px !important;
          height: 34px !important;
        }

        .nafh-hijri-calendar .rmdp-day span {
          width: 30px !important;
          height: 30px !important;
          color: var(--popover-foreground) !important;
          font-size: 0.85rem !important;
          line-height: 30px !important;
          border-radius: calc(var(--radius) * 0.6) !important;
          transition:
            background-color 0.15s ease,
            color 0.15s ease !important;
        }

        .nafh-hijri-calendar
          .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden)
          span:hover {
          background-color: var(--accent) !important;
          color: var(--accent-foreground) !important;
        }

        .nafh-hijri-calendar .rmdp-day.rmdp-today span {
          background-color: var(--muted) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
        }

        .nafh-hijri-calendar .rmdp-day.rmdp-selected span {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.16) !important;
        }

        .nafh-hijri-calendar .rmdp-day.rmdp-disabled span,
        .nafh-hijri-calendar .rmdp-day.rmdp-deactive span {
          color: var(--muted-foreground) !important;
          opacity: 0.35 !important;
        }
      `}</style>

      {/* Input Element Configured for Tailwind CSS v4 and RTL Padding Adjustments */}
      <DatePicker
        value={parsedValue}
        calendar={arabic}
        locale={arabic_ar}
        format='YYYY/MM/DD'
        placeholder={placeholder}
        className='nafh-hijri-calendar'
        containerClassName='w-full'
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
