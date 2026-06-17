'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { useDepartments } from '@/modules/hr/departments/hooks/use-departments'

interface Props {
  value?: string | null
  onChange: (department: any) => void
}

export function DepartmentCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useDepartments({
    page: 1,
    limit: 20,
    search,
  })

  const items = data?.data ?? data?.items ?? []
  const selected = items.find((item: any) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          className='w-full justify-between'
        >
          {selected ? selected.nameEn : 'Select department'}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[420px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search department...'
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isLoading && <CommandItem disabled>Loading...</CommandItem>}

            <CommandEmpty>No department found.</CommandEmpty>

            <CommandGroup>
              {items.map((department: any) => (
                <CommandItem
                  key={department.id}
                  value={`${department.code ?? ''} ${department.nameEn ?? ''} ${
                    department.nameAr ?? ''
                  }`}
                  onSelect={() => {
                    onChange(department)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === department.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className='flex flex-col'>
                    <span className='font-medium'>{department.nameEn}</span>

                    <span className='text-xs text-muted-foreground'>
                      {department.code}
                      {department.nameAr ? ` · ${department.nameAr}` : ''}
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
