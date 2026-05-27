'use client'

import { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Textarea } from '@/components/ui/textarea'

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>

  name: FieldPath<TFieldValues>

  label: string

  placeholder?: string

  disabled?: boolean
}

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
}: Props<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
