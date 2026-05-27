'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Checkbox } from '@/components/ui/checkbox'

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  disabled?: boolean
}

export function FormCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  disabled,
}: Props<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex items-center gap-3 space-y-0'>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>

          <FormLabel>{label}</FormLabel>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
