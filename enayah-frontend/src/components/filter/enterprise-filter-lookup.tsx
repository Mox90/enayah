'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
//import axios from 'axios'
// import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

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
  const { data } = useQuery({
    queryKey: [endpoint, search],
    queryFn: async () => {
      const res = await api.get(endpoint, {
        params: {
          page: 1,
          limit: 50,
          search,
        },
      })
      return res.data.data
    },
  })

  const options = useMemo(() => {
    return (data ?? []).map((e: any) => ({
      value: e[valueField],
      label: e[labelField],
    }))
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
