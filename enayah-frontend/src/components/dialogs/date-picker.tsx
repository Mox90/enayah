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
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          onClick={openCalendar}
          aria-required={required}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          // className={cn(
          //   'h-12 w-full justify-start rounded-lg border-border/80 text-left font-normal',
          //   'bg-transparent dark:bg-transparent',
          //   'transition-all duration-200',
          //   'hover:bg-transparent dark:hover:bg-transparent',
          //   'focus-visible:border-emerald-500',
          //   'focus-visible:bg-transparent dark:focus-visible:bg-transparent',
          //   'focus-visible:ring-4 focus-visible:ring-emerald-500/10',
          //   !value && 'text-muted-foreground',
          //   className,
          // )}
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
