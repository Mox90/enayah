'use client'

import { useMemo, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface EnterpriseFilterOption {
  value: string
  label: string
}

interface Props {
  value: string[]
  options: EnterpriseFilterOption[]
  placeholder?: string
  onChange: (value: string[]) => void
}

export function EnterpriseFilterMultiSelect({
  value,
  options,
  placeholder = 'Search...',
  onChange,
}: Props) {
  const [search, setSearch] = useState('')

  const filteredOptions = useMemo(() => {
    if (!search) return options

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    )
  }, [options, search])

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className='space-y-3'>
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className='h-56 rounded-md border p-3'>
        <div className='space-y-2'>
          {filteredOptions.map((option) => (
            <div key={option.value} className='flex items-center gap-3'>
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />

              <span className='text-sm'>{option.label}</span>
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div className='text-sm text-muted-foreground'>
              No records found.
            </div>
          )}
        </div>
      </ScrollArea>

      {value.length > 0 && (
        <div className='text-xs text-muted-foreground'>
          {value.length} selected
        </div>
      )}
    </div>
  )
}
