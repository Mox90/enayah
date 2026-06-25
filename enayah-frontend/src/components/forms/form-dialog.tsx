'use client'

import { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  headerClassName?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  headerClassName,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // className={cn('sm:max-w-lg [&>button>svg]:text-rose-400', className)}
        className={cn('[&>button>svg]:text-rose-400', className)}
      >
        <DialogHeader className={headerClassName}>
          <DialogTitle>{title}</DialogTitle>

          {description && (
            <DialogDescription className='sr-only'>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}
