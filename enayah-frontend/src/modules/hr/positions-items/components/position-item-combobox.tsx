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

//import { PositionItemLookupItem } from '@/modules/hr/onboarding/services/position-item-lookup.service'
//import { usePositionItemLookup } from '@/modules/hr/onboarding/hooks/use-position-item-lookup'

interface Props {
  value?: string | null
  //selectedLabel?: string
  onChange: (item: PositionItemLookupItem) => void
}

export function PositionItemCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = usePositionItemLookup({
    search: search || undefined,
    limit: 20,
  })

  const items = data?.items ?? []
  const selected = items.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-full justify-between'
        >
          {selected
            ? `${selected.itemNumber} — ${selected.positionTitleEn ?? ''}`
            : 'Select vacant PCN'}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[520px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search PCN, department, position...'
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isLoading && <CommandItem disabled>Loading...</CommandItem>}

            <CommandEmpty>No vacant position item found.</CommandEmpty>

            <CommandGroup>
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
                      {item.itemNumber} — {item.positionTitleEn}
                    </span>

                    <span className='text-xs text-muted-foreground'>
                      {item.departmentNameEn} · Category {item.categoryCode} ·{' '}
                      {item.workforceCategory}
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
