'use client'

import { Avatar } from '@/components/ui/avatar'

interface Props {
  employees: any[]
  isLoading: boolean
}

export function EmployeeKanbanView({ employees, isLoading }: Props) {
  if (isLoading) {
    return
    // <div>Loading...</div>
  }

  return (
    <div
      className='grid gap-4
                 sm:grid-cols-2
                 lg:grid-cols-3
                 xl:grid-cols-4'
    >
      {employees.map((employee) => (
        <div key={employee.id} className='rounded-lg border p-4'>
          <div className='mb-4 flex items-center gap-3'>
            <Avatar>{employee.fullNameEn?.charAt(0)}</Avatar>

            <div>
              <div className='font-medium'>{employee.employeeNumber}</div>

              <div className='text-muted-foreground text-xs'>Employee No.</div>
            </div>
          </div>

          <div className='space-y-1'>
            <div className='font-medium'>{employee.fullNameEn}</div>

            <div className='text-muted-foreground text-sm'>
              {employee.fullNameAr}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
