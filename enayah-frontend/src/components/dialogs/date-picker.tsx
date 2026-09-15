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
}

/**
 * Date picker using react-multi-date-picker.
 *
 * Display format: DD/MM/YYYY
 * Stored value: YYYY-MM-DD
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
}: Props) {
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement>()

  /*
   * Resolve the appropriate portal container from the actual
   * trigger button.
   *
   * - Inside a Radix/shadcn Dialog or Sheet:
   *   render the calendar inside the active modal.
   *
   * - Outside a dialog:
   *   render into document.body so parent overflow does not
   *   clip the calendar.
   */
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

  const selectedDate = value
    ? new DateObject({
        date: value,
        format: 'YYYY-MM-DD',
      })
    : null

  const displayValue = selectedDate
    ? selectedDate.format('DD/MM/YYYY')
    : hidePlaceholder
      ? ''
      : 'Select date'

  return (
    <DatePickerBase
      portal
      portalTarget={portalTarget}
      value={selectedDate}
      disabled={disabled}
      format='DD/MM/YYYY'
      calendarPosition='bottom-left'
      className='enayah-date-picker'
      containerClassName='w-full'
      onOpenPickNewDate={false}
      showOtherDays
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
      onChange={(selectedDate: DateObject | null) => {
        if (!selectedDate) {
          onChange(null)
          return
        }

        onChange(selectedDate.format('YYYY-MM-DD'))
      }}
    />
  )
}
