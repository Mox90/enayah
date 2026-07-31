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
import { useLocale, useTranslations } from 'next-intl'
import { CountryLookupItem } from '../services/countries.service'

interface Props {
  value?: string | null
  onChange: (country: CountryLookupItem) => void
  placeholder?: string
}

export function CountryCombobox({ value, onChange, placeholder }: Props) {
  const t = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data } = useCountries({
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
          {selected
            ? isRtl
              ? selected.nameAr
              : selected.name
            : placeholder || t('selectNationality')}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[350px] p-0'>
        <Command>
          <CommandInput
            placeholder={placeholder ? 'Search country...' : t('searchNat')}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>{t('noCountryFound')}</CommandEmpty>

            <CommandGroup>
              {data?.items.map((country) => (
                <CommandItem
                  key={country.id}
                  value={
                    isRtl
                      ? `${country.nameAr} ${country.nationalityAr}`
                      : `${country.name} ${country.nationalityEn}`
                  }
                  onSelect={() => {
                    onChange(country)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === country.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className='flex flex-col'>
                    <span>
                      {isRtl ? (country.nameAr ?? country.name) : country.name}
                    </span>

                    {!placeholder && (
                      <span className='text-xs text-muted-foreground'>
                        {isRtl
                          ? (country.nationalityAr ?? country.nationalityEn)
                          : country.nationalityEn}
                      </span>
                    )}
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
