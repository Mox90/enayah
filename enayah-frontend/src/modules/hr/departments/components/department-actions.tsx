'use client'

import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Department } from '../types/department.types'
import { useState } from 'react'
import { DeleteDepartmentDialog } from './delete-department-dialog'
import { EditDepartmentDialog } from './edit-department-dialog'

interface DepartmentActionsProps {
  department: Department
}

export function DepartmentActions({ department }: DepartmentActionsProps) {
  const [editOpen, setEditOpen] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className='text-destructive'
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDepartmentDialog
        department={department}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteDepartmentDialog
        department={department}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
