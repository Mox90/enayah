'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PositionItemLookupItem } from '../services/position-item-lookup.service'
import { usePositionItemLookup } from '../hooks/use-position-item-lookup'
import { useLocale, useTranslations } from 'next-intl'
import { toArabicDigits } from '@/utils/utilities'

interface Props {
  value?: string | null
  selectedLabel?: string | null
  onChange: (item: PositionItemLookupItem | null) => void
}

export function PositionItemCombobox({
  value,
  selectedLabel,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = usePositionItemLookup({
    search: search || undefined,
    limit: 20,
  })

  const items = data?.items ?? []
  const selected = items.find((item) => item.id === value)
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const pt = useTranslations('positionItems')
  const et = useTranslations('employees')

  //console.log('isRtl ?' + isRtl)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-full justify-between'
        >
          {/* {selected
            ? `${selected.itemNumber} — ${selected.positionTitleEn ?? ''}`
            : 'Select vacant PCN'} */}
          {selected
            ? `${selected.itemNumber} - ${isRtl ? selected.departmentNameAr : (selected.departmentNameEn ?? '')} - ${
                isRtl
                  ? (selected.positionTitleAr ?? selected.positionTitleEn ?? '')
                  : (selected.positionTitleEn ?? '')
              }`
            : selectedLabel
              ? selectedLabel
              : pt('selectVacant')}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[520px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={pt('searchPcnCombo')}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isLoading && <CommandItem disabled>Loading...</CommandItem>}

            <CommandEmpty>{pt('noVacantFound')}</CommandEmpty>

            <CommandGroup>
              {value && (
                <CommandItem
                  value='clear-pcn'
                  onSelect={() => {
                    onChange(null)
                    setOpen(false)
                    setSearch('')
                  }}
                  className='text-muted-foreground'
                >
                  {pt('clearSelection')}
                </CommandItem>
              )}

              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.itemNumber} ${item.departmentNameEn} ${item.positionTitleEn}`}
                  onSelect={() => {
                    onChange(item)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {item.itemNumber} —{' '}
                      {isRtl
                        ? (item.positionTitleAr ?? item.positionTitleEn)
                        : item.positionTitleEn}
                    </span>

                    <span className='text-xs text-muted-foreground'>
                      {isRtl ? item.departmentNameAr : item.departmentNameEn} ·{' '}
                      {isRtl ? 'فئة' : 'Category'}{' '}
                      {isRtl
                        ? toArabicDigits(item.categoryCode)
                        : (item.categoryCode ?? '')}{' '}
                      ·{' '}
                      {item.workforceCategory ? et(item.workforceCategory) : ''}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
