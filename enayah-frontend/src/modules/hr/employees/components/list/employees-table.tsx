'use client'

import { getEmployeeFullName } from '@/utils/utilities'
import { useLocale } from 'next-intl'

interface Props {
  employees: any[]
  isLoading: boolean
}

export function EmployeesTable({ employees, isLoading }: Props) {
  const locale = useLocale() as 'en' | 'ar'

  if (isLoading) {
    return
    //<div>Loading...</div>
  }

  //console.log(employees)

  return (
    <div className='rounded-lg border'>
      {employees.map((employee) => (
        <div key={employee.id} className='border-b p-4 last:border-b-0'>
          <div className='font-medium'>{employee.employeeNumber}</div>

          <div className='font-medium'>
            {getEmployeeFullName(employee, locale)}
          </div>
        </div>
      ))}
    </div>
  )
}
