'use client'

import { useState } from 'react'

import { countries } from 'country-codes-flags-phone-codes'

import { Button } from '@/components/ui/button'

import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (dialCode: string) => void
  className?: string
}

export function PhoneCodeCombobox({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const uniqueCountries = Object.values(
    countries.reduce(
      (acc, c) => {
        if (!acc[c.dialCode]) acc[c.dialCode] = c
        return acc
      },
      {} as Record<string, (typeof countries)[number]>,
    ),
  )

  const filtered = uniqueCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  )

  const selected =
    // countries.find((c) => c.dialCode === value) ??
    // countries.find((c) => c.code === 'SA')
    uniqueCountries.find((c) => c.dialCode === value) ??
    uniqueCountries.find((c) => c.code === 'SA')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          className={cn(
            'h-full w-[120px] justify-between rounded-none border-r px-3',
            className,
          )}
        >
          {selected?.flag} {selected?.dialCode}
          <ChevronsUpDown className='h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[320px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Search country...'
          />

          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>

            <CommandGroup>
              {filtered.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.dialCode)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === country.dialCode ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {country.flag} {country.name} ({country.dialCode})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
