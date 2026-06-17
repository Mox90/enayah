'use client'

import { useState } from 'react'

import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

import { useCountries } from '../hooks/use-countries'

interface Props {
  value?: string | null
  onChange: (id: string) => void
}

export function CountryCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useCountries({
    search,
    limit: 20,
  })
  //console.log({ data, isLoading, error })

  const selected = data?.items.find((x) => x.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-full justify-between'
        >
          {selected ? selected.name : 'Select nationality'}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[350px] p-0'>
        <Command>
          <CommandInput
            placeholder='Search nationality...'
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>

            <CommandGroup>
              {data?.items.map((country) => (
                <CommandItem
                  key={country.id}
                  value={`${country.name} ${country.nationalityEn}`}
                  onSelect={() => {
                    onChange(country.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === country.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className='flex flex-col'>
                    <span>{country.name}</span>

                    <span className='text-xs text-muted-foreground'>
                      {country.nationalityEn}
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
