// enayah-frontend/src/modules/countries/components/country-combobox.tsx

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

  /**
   * Fallback label for an already-selected country.
   *
   * This is important when the selected country is not included
   * in the currently loaded search result.
   */
  selectedLabel?: string | null

  onChange: (country: CountryLookupItem) => void
  placeholder?: string
}

export function CountryCombobox({
  value,
  selectedLabel,
  onChange,
  placeholder,
}: Props) {
  const t = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data } = useCountries({
    search,
    limit: 20,
  })

  /*
   * The selected country may not exist in data.items.
   *
   * Example:
   * 1. User searches for Armenia.
   * 2. Selects Armenia.
   * 3. Goes to Next step.
   * 4. Comes Back.
   * 5. search resets to ''.
   * 6. Armenia may not be in the first 20 results.
   *
   * countryId is still valid, so fall back to selectedLabel.
   */
  const selected = data?.items.find((country) => country.id === value)

  const displayLabel = selected
    ? isRtl
      ? selected.nameAr || selected.name
      : selected.name
    : value
      ? selectedLabel
      : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full h-11 justify-between'
        >
          <span className='truncate'>
            {displayLabel || placeholder || t('selectNationality')}
          </span>

          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
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
              {data?.items.map((country) => {
                const resolvedName = isRtl
                  ? country.nameAr || country.name
                  : country.name
                const resolvedNationality = !placeholder
                  ? isRtl
                    ? country.nationalityAr || country.nationalityEn
                    : country.nationalityEn
                  : ''
                return (
                  <CommandItem
                    key={country.id}
                    // value={
                    //   isRtl
                    //     ? `${country.nameAr} ${country.nationalityAr}`
                    //     : `${country.name} ${country.nationalityEn}`
                    // }
                    value={`${resolvedName} ${resolvedNationality}`}
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
                      <span>{resolvedName}</span>

                      {!placeholder && resolvedNationality && (
                        <span className='text-xs text-muted-foreground'>
                          {resolvedNationality}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
