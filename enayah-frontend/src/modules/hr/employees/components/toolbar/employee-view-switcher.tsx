'use client'

import { LayoutGrid } from 'lucide-react'
import { List } from 'lucide-react'
import { Network } from 'lucide-react'
import { GitBranch } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { EmployeeView } from '../../types/employee-view.types'
import { ButtonGroup } from '@/components/ui/button-group'

interface Props {
  view: EmployeeView

  onViewChange: (view: EmployeeView) => void
}

export function EmployeeViewSwitcher({ view, onViewChange }: Props) {
  return (
    <div className='flex items-center gap-1'>
      <ButtonGroup>
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          size='icon'
          onClick={() => onViewChange('list')}
        >
          <List />
        </Button>

        <Button
          variant={view === 'kanban' ? 'default' : 'outline'}
          size='icon'
          onClick={() => onViewChange('kanban')}
        >
          <LayoutGrid />
        </Button>

        <Button
          variant={view === 'tree' ? 'default' : 'outline'}
          size='icon'
          onClick={() => onViewChange('tree')}
        >
          <GitBranch />
        </Button>

        <Button
          variant={view === 'hierarchy' ? 'default' : 'outline'}
          size='icon'
          onClick={() => onViewChange('hierarchy')}
        >
          <Network />
        </Button>
      </ButtonGroup>
    </div>
  )
}
