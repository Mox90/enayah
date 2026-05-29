'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Department } from '../types/department.types'
import { useDeleteDepartment } from '../hooks/use-delete-departments'

interface Props {
  department: Department
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDepartmentDialog({
  department,
  open,
  onOpenChange,
}: Props) {
  const deleteDepartment = useDeleteDepartment()

  const handleDelete = async () => {
    await deleteDepartment.mutateAsync(department.id)

    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Department</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete <strong>{department.nameEn}</strong>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
