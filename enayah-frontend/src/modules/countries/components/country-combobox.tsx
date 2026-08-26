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

import type { CountryLookupItem } from '../services/countries.service'

interface Props {
  value?: string | null

  selectedLabel?: string | null

  /*
   * Country IDs or alpha2 values that should not be
   * displayed in the combobox.
   *
   * For the employee filter we will use alpha2.
   */
  excludeAlpha2?: string[]

  onChange: (country: CountryLookupItem) => void

  placeholder?: string
}

export function CountryCombobox({
  value,
  selectedLabel,
  excludeAlpha2 = [],
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

  const allItems = data?.items ?? []

  /*
   * Keep selected lookup against all items so the existing
   * onboarding single-selection behaviour remains unchanged.
   */
  const selected = allItems.find((country) => country.id === value)

  /*
   * Remove countries that are already selected by a
   * multi-select consumer such as EmployeeFilterSheet.
   */
  const items = allItems.filter(
    (country) => !country.alpha2 || !excludeAlpha2.includes(country.alpha2),
  )

  const displayLabel = selected
    ? isRtl
      ? selected.nameAr || selected.name
      : selected.name
    : value
      ? selectedLabel
      : null

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          setSearch('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='h-11 w-full justify-between'
        >
          <span className='truncate'>
            {displayLabel || placeholder || t('selectNationality')}
          </span>

          <ChevronsUpDown className='ms-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='w-[var(--radix-popover-trigger-width)] p-0'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder ? 'Search country...' : t('searchNat')}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>{t('noCountryFound')}</CommandEmpty>

            <CommandGroup>
              {items.map((country) => {
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
                    value={`${country.alpha2 ?? ''} ${
                      country.name ?? ''
                    } ${country.nameAr ?? ''} ${
                      country.nationalityEn ?? ''
                    } ${country.nationalityAr ?? ''}`}
                    onSelect={() => {
                      onChange(country)
                      setSearch('')
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`me-2 h-4 w-4 ${
                        value === country.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    <div className='min-w-0 flex flex-col'>
                      <span className='truncate'>{resolvedName}</span>

                      {!placeholder && resolvedNationality && (
                        <span className='truncate text-xs text-muted-foreground'>
                          {country.alpha2 && (
                            <>
                              {country.alpha2}
                              {' · '}
                            </>
                          )}

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
