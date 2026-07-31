'use client'

import { Avatar } from '@/components/ui/avatar'
import { getEmployeeFullName } from '@/utils/utilities'
import { useLocale } from 'next-intl'

interface Props {
  employees: any[]
  isLoading: boolean
}

export function EmployeeKanbanView({ employees, isLoading }: Props) {
  console.log(employees)
  const locale = useLocale() as 'en' | 'ar'
  if (isLoading) {
    return
    // <div>Loading...</div>
  }

  //console.log(employees)

  return (
    <div
      className='grid gap-4
                 sm:grid-cols-2
                 lg:grid-cols-3
                 xl:grid-cols-4'
    >
      {employees.map((employee) => (
        <div key={employee.id} className='rounded-lg border p-4'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-25 w-25 flex justify-center'>
              <h1 className='flex justify-center items-center text-2xl'>
                {locale === 'en'
                  ? employee.firstNameEn.charAt(0) +
                    '' +
                    employee.familyNameEn.charAt(0)
                  : employee.firstNameAr.charAt(0) +
                    '' +
                    employee.familyNameAr.charAt(0)}
              </h1>
            </Avatar>

            <div>
              <div className='font-medium'>{employee.employeeNumber}</div>
              <div className='text-muted-foreground text-xs'>Employee No.</div>
            </div>
          </div>

          <div className='space-y-1'>
            <div className='font-medium'>
              Name: {getEmployeeFullName(employee, locale)}
            </div>
            <div className='font-medium'>
              Date of Birth: {employee.dateOfBirth}
            </div>
            <div className='font-medium'>
              Nationality:
              {locale === 'en'
                ? employee.nationality?.nationalityEn
                : employee.nationality?.nationalityAr}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
