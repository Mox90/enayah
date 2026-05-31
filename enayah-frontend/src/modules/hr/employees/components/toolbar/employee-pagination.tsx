'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'

interface Props {
  hidden?: boolean
}

export function EmployeePagination({ hidden }: Props) {
  const locale = useLocale()
  const isRTL = locale === 'ar'
  if (hidden) return null

  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground text-sm'>1-10 of 10,284</span>

      <Button
        variant='outline'
        size='icon'
        aria-label='Previous Page'
        //onClick={() => onPageChange(page - 1)}
        //disabled={page <= 1}
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
        aria-label='Next Page'
        //onClick={() => onPageChange(page + 1)}
        //disabled={page >= pageCount}
      >
        {isRTL ? (
          <ChevronLeft className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
    </div>
  )
}
