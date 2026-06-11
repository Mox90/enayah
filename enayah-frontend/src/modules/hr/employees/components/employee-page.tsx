'use client'

import { EmployeeWorkspace } from './employee-workspace'
import { useTranslations } from 'next-intl'

export default function EmployeesPage() {
  const t = useTranslations('employees')

  return (
    <div className='space-y-6'>
      <EmployeeWorkspace />
    </div>
  )
}
