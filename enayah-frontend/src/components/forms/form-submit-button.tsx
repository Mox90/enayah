'use client'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  isLoading?: boolean
  label: string
  loadingLabel?: string
}

export function FormSubmitButton({ isLoading, label, loadingLabel }: Props) {
  return (
    <Button type='submit' disabled={isLoading} className='w-full'>
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />

          {loadingLabel ?? 'Loading...'}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
