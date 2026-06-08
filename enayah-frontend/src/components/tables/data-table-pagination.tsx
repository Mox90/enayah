'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps {
  page: number
  pageCount: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function DataTablePagination({
  page,
  pageCount,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  const t = useTranslations('table')
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale).format(value)

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      {/* record count */}
      <div className='text-sm text-muted-foreground'>
        {locale === 'ar'
          ? `${formatNumber(start)} - ${formatNumber(end)} ${t('of')} ${formatNumber(total)} ${t('records')}`
          : `${formatNumber(start)} - ${formatNumber(end)} ${t('of')} ${formatNumber(total)} ${t('records')}`}
      </div>

      <div className='flex items-center gap-4'>
        {/* rows per page */}
        <div className='flex items-center gap-2'>
          <p className='text-sm text-muted-foreground'>{t('rows')}</p>

          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              onLimitChange(Number(value))
              onPageChange(1)
            }}
          >
            <SelectTrigger className='h-8 w-[80px]'>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 25, 50, 100, 250, 500].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* page info */}
        <div className='text-sm text-muted-foreground'>
          {locale === 'ar'
            ? `${t('page')} ${formatNumber(page)} ${t('of')} ${formatNumber(pageCount)}`
            : `${t('page')} ${formatNumber(page)} ${t('of')} ${formatNumber(pageCount)}`}
        </div>

        {/* buttons */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            aria-label='Previous Page'
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
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
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            {isRTL ? (
              <ChevronLeft className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
