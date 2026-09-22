// enayah-frontend/src/components/dialogs/date-picker.tsx

'use client'

import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import DatePickerBase, { DateObject } from 'react-multi-date-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type DatePickerValue = string | null

interface Props {
  id?: string
  value?: DatePickerValue
  onChange: (value: DatePickerValue) => void
  className?: string
  disabled?: boolean
  hidePlaceholder?: boolean
  required?: boolean
  ariaInvalid?: boolean
  ariaDescribedBy?: string
  minDate?: string
  maxDate?: string
}

/**
 * Date picker using react-multi-date-picker.
 *
 * Display format: DD/MM/YYYY
 * Stored value: YYYY-MM-DD
 *
 * minDate and maxDate are inclusive.
 *
 * The calendar uses portal mode so it is not clipped by
 * scrollable/overflow-hidden parent containers.
 *
 * When rendered inside a modal dialog, the portal is mounted
 * inside that dialog so the modal still allows interaction
 * with the calendar.
 */
export function DatePicker({
  id,
  value,
  onChange,
  className,
  disabled = false,
  hidePlaceholder = false,
  required = false,
  ariaInvalid = false,
  ariaDescribedBy,
  minDate,
  maxDate,
}: Props) {
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement>()

  /* ------------------------------------------------------------------------ */
  /* Portal target                                                            */
  /* ------------------------------------------------------------------------ */

  const setTriggerRef = React.useCallback((node: HTMLButtonElement | null) => {
    if (!node) {
      return
    }

    const dialog = node.closest<HTMLElement>('[role="dialog"]')

    const nextPortalTarget = dialog ?? document.body

    setPortalTarget((current) =>
      current === nextPortalTarget ? current : nextPortalTarget,
    )
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Selected date                                                            */
  /* ------------------------------------------------------------------------ */

  const selectedDate = value
    ? new DateObject({
        date: value,
        format: 'YYYY-MM-DD',
      })
    : null

  /* ------------------------------------------------------------------------ */
  /* Date boundaries                                                          */
  /* ------------------------------------------------------------------------ */

  const minimumDate = minDate
    ? new DateObject({
        date: minDate,
        format: 'YYYY-MM-DD',
      })
    : undefined

  const maximumDate = maxDate
    ? new DateObject({
        date: maxDate,
        format: 'YYYY-MM-DD',
      })
    : undefined

  /* ------------------------------------------------------------------------ */
  /* Display value                                                            */
  /* ------------------------------------------------------------------------ */

  const displayValue = selectedDate
    ? selectedDate.format('DD/MM/YYYY')
    : hidePlaceholder
      ? ''
      : 'Select date'

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DatePickerBase
      portal
      portalTarget={portalTarget}
      value={selectedDate}
      disabled={disabled}
      // ------------------------------------------------
      // Date restrictions
      // ------------------------------------------------

      minDate={minimumDate}
      maxDate={maximumDate}
      // ------------------------------------------------
      // Formatting
      // ------------------------------------------------

      format='DD/MM/YYYY'
      calendarPosition='bottom-left'
      className='enayah-date-picker'
      containerClassName='w-full'
      onOpenPickNewDate={false}
      showOtherDays
      // ------------------------------------------------
      // Calendar day styling
      // ------------------------------------------------

      mapDays={({ date, currentMonth }) => {
        const isOtherMonth = date.month.index !== currentMonth.index

        const isSunday = date.weekDay.index === 0

        const isFriday = date.weekDay.index === 5

        const classes = [
          isOtherMonth && 'enayah-other-month-day',
          isSunday && 'enayah-sunday',
          isFriday && 'enayah-friday',
        ]
          .filter(Boolean)
          .join(' ')

        return {
          className: classes,
        }
      }}
      // ------------------------------------------------
      // Trigger button
      // ------------------------------------------------

      render={(_, openCalendar) => (
        <Button
          ref={setTriggerRef}
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          onClick={openCalendar}
          aria-required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'h-12 w-full justify-start rounded-lg border-border/80 text-left font-normal',
            'bg-transparent dark:bg-transparent',
            'transition-all duration-200',
            'hover:bg-transparent dark:hover:bg-transparent',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDays
            className={cn(
              'h-4 w-4 shrink-0',
              displayValue ? 'me-2' : 'ms-auto',
            )}
          />

          {displayValue && <span>{displayValue}</span>}
        </Button>
      )}
      // ------------------------------------------------
      // Date selection
      // ------------------------------------------------

      onChange={(date: DateObject | null) => {
        if (!date) {
          onChange(null)
          return
        }

        const nextValue = date.format('YYYY-MM-DD')

        /*
         * Additional defensive validation.
         *
         * Since all values use YYYY-MM-DD,
         * string comparisons preserve
         * chronological ordering.
         */

        if (minDate && nextValue < minDate) {
          return false
        }

        if (maxDate && nextValue > maxDate) {
          return false
        }

        onChange(nextValue)
      }}
    />
  )
}
