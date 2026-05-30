'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

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

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Control, FieldPath, FieldValues } from 'react-hook-form'

import { useState } from 'react'

interface Option {
  label: string
  value: string
}

interface FormComboboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearable?: boolean
  clearLabel?: string
}

export function FormCombobox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearLabel,
  clearable,
}: FormComboboxProps<TFieldValues>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col'>
          <FormLabel>{label}</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant='outline'
                  role='combobox'
                  className={cn(
                    'justify-between',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label
                    : (placeholder ?? 'Select option')}

                  <ChevronsUpDown className='opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className='w-full p-0'>
              <Command>
                <CommandInput placeholder={searchPlaceholder ?? 'Search...'} />

                <CommandList>
                  <CommandEmpty>
                    {emptyMessage ?? 'No results found.'}
                  </CommandEmpty>

                  <CommandGroup>
                    {clearable && (
                      <CommandItem
                        value='__clear__'
                        onSelect={() => {
                          field.onChange(undefined)

                          setOpen(false)
                        }}
                      >
                        {clearLabel ?? 'None'}
                      </CommandItem>
                    )}
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value)
                          setOpen(false)
                        }}
                      >
                        {option.label}

                        <Check
                          className={cn(
                            'ml-auto',
                            option.value === field.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
