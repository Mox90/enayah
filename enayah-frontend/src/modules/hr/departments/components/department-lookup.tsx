'use client'

import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useDepartments } from '../hooks/use-departments'
import { useLocale } from 'next-intl'

interface Props {
  value: string[]
  onChange: (ids: string[]) => void
}

export function DepartmentLookup({ value, onChange }: Props) {
  const locale = useLocale()
  const [search, setSearch] = useState('')
  const isRtl = locale === 'ar' // Example check for RTL languages

  const { data } = useDepartments({
    page: 1,
    limit: 20,
    search,
  })

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
        placeholder='Search department...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className='h-64 border rounded-md'>
        <div className='p-3 space-y-2'>
          {data?.data.map((department) => (
            <div key={department.id} className='flex items-center gap-3'>
              <Checkbox
                checked={value.includes(department.id)}
                onCheckedChange={() => toggle(department.id)}
              />

              <span>{isRtl ? department.nameAr : department.nameEn}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
