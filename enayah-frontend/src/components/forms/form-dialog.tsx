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
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  headerClassName,
  bodyClassName,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // className={cn('sm:max-w-lg [&>button>svg]:text-rose-400', className)}
        //className={cn('[&>button>svg]:text-rose-400', className)}
        className={cn(
          // The dialog owns its viewport limits and internal row structure.
          'grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0',

          // Keep the dialog within the viewport without forcing full height.
          'max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)]',
          'sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]',

          '[&>button>svg]:text-rose-400',

          className,
        )}
      >
        <DialogHeader className={cn('shrink-0', headerClassName)}>
          <DialogTitle>{title}</DialogTitle>

          {description && (
            <DialogDescription className='sr-only'>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div
          className={cn('flex min-h-0 flex-col overflow-hidden', bodyClassName)}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
