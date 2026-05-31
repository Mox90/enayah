'use client'

import { EmployeeWorkspace } from './employee-workspace'
import { useTranslations } from 'next-intl'

export default function EmployeesPage() {
  const t = useTranslations('employees')

  return (
    <div className='space-y-6'>
      {/* <div>
        <h1 className='text-3xl font-bold'>{t('employees')}</h1>

        <p className='text-muted-foreground'>{t('subTitle')}</p>
      </div> */}

      <EmployeeWorkspace />
    </div>
  )
}
