'use client'

import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useLocale } from 'next-intl'
import { useDirection } from '@/hooks/useDirection'

interface Props {
  hidden?: boolean

  total: number

  range: {
    start: number
    end: number
  }

  onRangeChange: (range: { start: number; end: number }) => void
}

export function EmployeePagination({
  hidden,
  range,
  total,
  onRangeChange,
}: Props) {
  const locale = useLocale()
  //const isRTL = locale === 'ar'
  const [inputValue, setInputValue] = useState(`${range.start}-${range.end}`)
  const [error, setError] = useState<string>('')
  const { dir, isRTL = locale === 'ar' } = useDirection()

  useEffect(() => {
    if (range.start === range.end) {
      setInputValue(range.start.toString())
      return
    }

    setInputValue(`${range.start}-${range.end}`)
  }, [range])

  if (hidden) return null

  const commitRange = () => {
    const value = inputValue.trim()

    setError('')

    /**
     * Single Record
     *
     * 1
     * 2
     * 3
     */
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

    /**
     * Range
     *
     * 1-10
     * 4-8
     * 2-2
     */
    const match = value.match(/^(\d+)-(\d+)$/)
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

  const handleNext = () => {
    const count = range.end - range.start + 1
    const newStart = range.end + 1
    if (newStart > total) return

    const newEnd = Math.min(total, newStart + count - 1)

    onRangeChange({
      start: newStart,
      end: newEnd,
    })
  }

  const handlePrevious = () => {
    const count = range.end - range.start + 1
    const newStart = Math.max(1, range.start - count)
    const newEnd = Math.min(total, newStart + count - 1)
    onRangeChange({
      start: newStart,
      end: newEnd,
    })
  }

  const canGoPrevious = range.start > 1
  const canGoNext = range.end < total

  return (
    <div className='flex flex-col items-end gap-1'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center text-sm font-medium text-foreground'>
          <Input
            className='h-auto w-14 rounded-none border-0 border-b border-transparent bg-transparent p-0 text-right shadow-none focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitRange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitRange()
              }
            }}
          />

          <span className='text-muted-foreground'>
            /{total.toLocaleString()}
          </span>
        </div>

        <ButtonGroup>
          <Button
            variant='outline'
            size='icon'
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
            variant='outline'
            size='icon'
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

      {error && <p className='text-destructive text-xs'>{error}</p>}
    </div>
  )
}
