'use client'

import { useState } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { useDirection } from '@/hooks/useDirection'

interface Range {
  start: number
  end: number
}

interface Props {
  hidden?: boolean
  total: number
  range: Range
  onRangeChange: (range: Range) => void
}

interface RangeInputProps {
  range: Range
  total: number
  onRangeChange: (range: Range) => void
}

function formatRange(range: Range): string {
  return range.start === range.end
    ? range.start.toString()
    : `${range.start}-${range.end}`
}

function RangeInput({ range, total, onRangeChange }: RangeInputProps) {
  const initialValue = formatRange(range)

  const [inputValue, setInputValue] = useState(initialValue)
  const [error, setError] = useState('')

  const commitRange = () => {
    const value = inputValue.trim()

    setError('')

    if (/^\d+$/.test(value)) {
      const record = Number(value)

      if (record < 1 || record > total) {
        setError(`Record must be between 1 and ${total.toLocaleString()}`)
        return
      }

      onRangeChange({
        start: record,
        end: record,
      })

      return
    }

    const match = value.match(/^(\d+)\s*-\s*(\d+)$/)

    if (match) {
      const start = Number(match[1])
      const end = Number(match[2])

      if (start < 1) {
        setError('Start record must be greater than zero')
        return
      }

      if (end > total) {
        setError(`End record cannot exceed ${total.toLocaleString()}`)
        return
      }

      if (start > end) {
        setError('Start record cannot be greater than end record')
        return
      }

      onRangeChange({
        start,
        end,
      })

      return
    }

    setError('Invalid format. Use 5 or 5-10')
  }

  const cancelEditing = () => {
    setInputValue(initialValue)
    setError('')
  }

  return (
    <div className='flex flex-col items-end gap-1'>
      <div className='flex items-center text-sm font-medium text-foreground'>
        <Input
          aria-label='Employee record range'
          className='h-auto w-14 rounded-none border-0 border-b border-transparent bg-transparent p-0 text-right shadow-none focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0'
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)

            if (error) {
              setError('')
            }
          }}
          onBlur={commitRange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }

            if (event.key === 'Escape') {
              cancelEditing()
              event.currentTarget.blur()
            }
          }}
        />

        <span className='text-muted-foreground'>/{total.toLocaleString()}</span>
      </div>

      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  )
}

export function EmployeePagination({
  hidden,
  range,
  total,
  onRangeChange,
}: Props) {
  const { isRTL } = useDirection()

  if (hidden) {
    return null
  }

  const handleNext = () => {
    const count = range.end - range.start + 1
    const newStart = range.end + 1

    if (newStart > total) {
      return
    }

    onRangeChange({
      start: newStart,
      end: Math.min(total, newStart + count - 1),
    })
  }

  const handlePrevious = () => {
    const count = range.end - range.start + 1
    const newStart = Math.max(1, range.start - count)

    onRangeChange({
      start: newStart,
      end: Math.min(total, newStart + count - 1),
    })
  }

  const canGoPrevious = range.start > 1
  const canGoNext = range.end < total

  return (
    <div className='flex items-start gap-2'>
      <RangeInput
        key={`${range.start}-${range.end}`}
        range={range}
        total={total}
        onRangeChange={onRangeChange}
      />

      <ButtonGroup>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Previous records'
          onClick={handlePrevious}
          disabled={!canGoPrevious}
        >
          {isRTL ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
        </Button>

        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Next records'
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {isRTL ? (
            <ChevronLeft className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </Button>
      </ButtonGroup>
    </div>
  )
}
