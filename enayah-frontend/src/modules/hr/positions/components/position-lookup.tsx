import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { usePositions } from '../hooks/use-positions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  value: string[]
  onChange: (ids: string[]) => void
}

export function PositionLookup({ value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const { data } = usePositions({
    page: 1,
    limit: 20,
    search,
  })

  //console.log('Positions:', data)

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
        placeholder='Search position...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className='h-64 border rounded-md'>
        <div className='p-3 space-y-2'>
          {data?.data.map((position) => (
            <div key={position.id} className='flex items-center gap-3'>
              <Checkbox
                checked={value.includes(position.id)}
                onCheckedChange={() => toggle(position.id)}
              />

              <span>{position.titleEn}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
