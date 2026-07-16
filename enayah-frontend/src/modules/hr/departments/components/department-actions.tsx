'use client'

import { MoreVerticalIcon } from 'lucide-react'
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
import { useLocale, useTranslations } from 'next-intl'

interface DepartmentActionsProps {
  department: Department
}

export function DepartmentActions({ department }: DepartmentActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const t = useTranslations('common')
  const dT = useTranslations('departments')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label={dT('departmentActions')}
          >
            <MoreVerticalIcon className='h-4 w-4 text-green-700' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuItem
            className='text-destructive'
            onClick={() => setDeleteOpen(true)}
          >
            {t('delete')}
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
