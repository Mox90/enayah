'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

import { useCountries } from '../hooks/use-countries'

interface Props {
  value?: string | null
  onChange: (id: string) => void
}

export function CountryLookup({ value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const { data } = useCountries({
    search,
    limit: 20,
  })

  return (
    <div className='space-y-2'>
      <Input
        placeholder='Search nationality...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className='h-64 rounded-md border'>
        <div className='p-2 space-y-1'>
          {data?.items?.map((country) => (
            <label
              key={country.id}
              className='flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted'
            >
              <Checkbox
                checked={value === country.id}
                onCheckedChange={() => onChange(country.id)}
              />

              <div className='flex flex-col'>
                <span className='font-medium'>{country.name}</span>

                <span className='text-xs text-muted-foreground'>
                  {country.nationalityEn}
                </span>
              </div>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
