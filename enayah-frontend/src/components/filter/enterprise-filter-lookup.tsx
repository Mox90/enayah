'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
//import axios from 'axios'
// import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'

type LookupRow = Record<string, unknown>

type LookupResponse = {
  data: LookupRow[]
}

type LookupOption = {
  value: string
  label: string
}

interface Props {
  endpoint: string
  valueField: string
  labelField: string
  value: string[]
  onChange: (value: string[]) => void
}

export function EnterpriseFilterLookup({
  endpoint,
  valueField,
  labelField,
  value,
  onChange,
}: Props) {
  const [search, setSearch] = useState('')
  const { data = [] } = useQuery<LookupRow[]>({
    queryKey: [endpoint, search],
    queryFn: async () => {
      const res = await api.get<LookupResponse>(endpoint, {
        params: {
          page: 1,
          limit: 50,
          search,
        },
      })
      return res.data.data
    },
    enabled: !!endpoint,
  })

  const options = useMemo<LookupOption[]>(() => {
    return data

      .map((row) => {
        const rawValue = row[valueField]
        const rawLabel = row[labelField]
        if (typeof rawValue !== 'string') {
          return null
        }

        return {
          value: rawValue,
          label:
            typeof rawLabel === 'string' || typeof rawLabel === 'number'
              ? String(rawLabel)
              : rawValue,
        }
      })
      .filter((option): option is LookupOption => option !== null)
  }, [data, valueField, labelField])

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x != id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className='space-y-3'>
      <Input
        placeholder='Search...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className='h-56'>
        <div className='space-y-2'>
          {options.map((option) => (
            <div key={option.value} className='flex items-center gap-2'>
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />

              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
