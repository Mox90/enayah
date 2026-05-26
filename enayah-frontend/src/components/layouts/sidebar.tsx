'use client'

import { usePermission } from '@/hooks/usePermission'
//import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { Link } from '../../../i18n/navigation'

const Sidebar = () => {
  const locale = useLocale()
  //const canViewAuditLogs = usePermission('audit_logs.view')
  return (
    <aside className='hidden w-64 border-r bg-background lg:block'>
      <div className='flex h-16 items-center border-b px-6'>
        <Image
          src='/MODHS3.png'
          alt='MODHS Logo'
          width={45}
          height={45}
          className='h-auto w-auto rounded-full object-contain'
          priority
        />
        <h1
          className={`truncate text-3xl ${locale === 'ar' ? 'pr-2.5' : 'pl-2.5'} font-bold`}
        >
          ENYH
        </h1>
      </div>

      <nav className='space-y-2 p-4'>
        <Link href='/dashboard'>Dashboard</Link>
        <Link href='/employees'>Employees</Link>
        <Link href='/departments'>Departments</Link>
        <Link href='/audit-logs'>Audit Logs</Link>
      </nav>
    </aside>
  )
}

export default Sidebar
