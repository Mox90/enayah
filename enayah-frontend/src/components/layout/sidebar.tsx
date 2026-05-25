'use client'

import { usePermission } from '@/hooks/usePermission'
import { Link } from 'lucide-react'
import React from 'react'

const Sidebar = () => {
  //const canViewAuditLogs = usePermission('audit_logs.view')
  return (
    <aside className='hidden w-64 border-r bg-background lg:block'>
      <div className='border-b p-6'>
        <h2 className='text-xl font-bold'>Enayah HCM</h2>
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
