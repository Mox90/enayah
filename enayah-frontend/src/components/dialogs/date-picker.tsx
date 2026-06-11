'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props {
  value?: string
  onChange: (value?: string) => void
}

export function DatePicker({ value, onChange }: Props) {
  const date = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />

          {date ? format(date, 'PPP') : 'Select date'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(d) => onChange(d ? format(d, 'yyyy-MM-dd') : undefined)}
          //initialFocus
          captionLayout='dropdown'
        />
      </PopoverContent>
    </Popover>
  )
}
