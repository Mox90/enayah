'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  selectedCount: number
}

export function EmployeeSelectionActions({ selectedCount }: Props) {
  if (selectedCount === 0) {
    return <Input placeholder='Search Employee' />
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='font-medium'>{selectedCount} Selected</span>

      <Button variant='outline' size='sm'>
        Export
      </Button>

      <Button variant='outline' size='sm'>
        Print
      </Button>

      <Button variant='outline' size='sm'>
        Actions
      </Button>
    </div>
  )
}
