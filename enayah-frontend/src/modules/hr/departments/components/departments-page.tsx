'use client'

import { DepartmentsTable } from '../components/departments-table'
import { CreateDepartmentDialog } from '../components/create-department-dialog'
import { useTranslations } from 'next-intl'
//import { getTranslations } from 'next-intl/server'

export default function DepartmentsPage() {
  const t = useTranslations('departments')
  //const t = await getTranslations('departments')
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{t('departmentName')}</h1>

          <p className='text-muted-foreground'>{t('subTitle')}</p>
        </div>

        <CreateDepartmentDialog />
      </div>

      <DepartmentsTable />
    </div>
  )
}
