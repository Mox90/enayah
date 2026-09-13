// enayah-frontend/src/components/forms/floating-field.tsx

import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FloatingFieldProps {
  id?: string
  label: ReactNode
  filled?: boolean
  invalid?: boolean
  required?: boolean
  children: ReactNode
  className?: string
}

export function FloatingField({
  id,
  label,
  filled = false,
  invalid = false,
  required = false,
  children,
  className,
}: FloatingFieldProps) {
  return (
    <div
      data-slot='floating-field'
      data-filled={filled ? 'true' : 'false'}
      data-invalid={invalid ? 'true' : 'false'}
      className={cn('relative', className)}
    >
      {children}

      <Label htmlFor={id} data-slot='floating-label'>
        {label}

        {required && (
          <span aria-hidden='true' className='ms-1 text-destructive'>
            *
          </span>
        )}
      </Label>
    </div>
  )
}
