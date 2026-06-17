'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
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

interface AllowanceOption {
  value: string
  label: string
}

interface Props {
  value: string
  options: AllowanceOption[]
  onChange: (value: string) => void
}

export function AllowanceTypeCombobox({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((option) => option.value === value)

  const filtered = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase()),
  )

  const canAddCustom =
    search.trim() &&
    !options.some(
      (option) =>
        option.value.toLowerCase() === search.toLowerCase() ||
        option.label.toLowerCase() === search.toLowerCase(),
    ) &&
    value.toLowerCase() !== search.toLowerCase()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          className='w-full justify-between'
        >
          {selected?.label || value || 'Select allowance type'}

          <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[320px] p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Search or add allowance...'
          />

          <CommandList>
            <CommandEmpty>No allowance found.</CommandEmpty>

            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />

                  {option.label}
                </CommandItem>
              ))}

              {canAddCustom && (
                <CommandItem
                  value={search}
                  onSelect={() => {
                    onChange(search.trim())
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add “{search.trim()}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
