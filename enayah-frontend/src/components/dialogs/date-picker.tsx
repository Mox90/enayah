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
}: Props) {
  const selectedDate = value
    ? new DateObject({
        date: value,
        format: 'YYYY-MM-DD',
      })
    : null

  const displayValue = selectedDate
    ? selectedDate.format('DD/MM/YYYY')
    : 'Select date'

  return (
    <DatePickerBase
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
          className={cn(
            'h-11 w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDays className='mr-2 h-4 w-4 shrink-0' />

          {displayValue}
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
