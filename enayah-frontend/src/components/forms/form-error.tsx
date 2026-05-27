'use client'

import { FieldError } from 'react-hook-form'

interface FormErrorProps {
  error?: FieldError
}

export function FormError({ error }: FormErrorProps) {
  if (!error?.message) return null

  return <p className='text-sm font-medium text-destructive'>{error.message}</p>
}
