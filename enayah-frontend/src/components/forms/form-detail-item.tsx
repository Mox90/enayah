'use client'

import { ReactNode } from 'react'

interface DetailItemProps {
  label: string
  value?: ReactNode
  valueDirection?: 'ltr' | 'rtl'
}

export function DetailItem({ label, value, valueDirection }: DetailItemProps) {
  return (
    <div className='min-w-0'>
      <div className='mb-1 text-xs font-medium text-muted-foreground'>
        {label}
      </div>

      <div
        className='break-words text-sm font-medium text-foreground'
        dir={valueDirection}
      >
        {value === null || value === undefined || value === '' ? '-' : value}
      </div>
    </div>
  )
}
