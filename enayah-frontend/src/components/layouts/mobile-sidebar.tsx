'use client'

import Image from 'next/image'

import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { useLocale } from 'next-intl'
import { Link } from '../../../i18n/navigation'

//import { Link } from '@/i18n/navigation'

const MobileSidebar = () => {
  const locale = useLocale()

  return (
    <Sheet>
      <SheetTrigger className='lg:hidden'>
        <Menu className='h-6 w-6' />
      </SheetTrigger>

      <SheetContent
        side={locale === 'ar' ? 'right' : 'left'}
        className='w-64 p-0'
      >
        {/* HEADER */}
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
            className={`truncate text-3xl font-bold ${
              locale === 'ar' ? 'pr-2.5' : 'pl-2.5'
            }`}
          >
            ENYH
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className='space-y-2 p-4'>
          <Link href='/dashboard'>Dashboard</Link>
          <Link href='/employees'>Employees</Link>
          <Link href='/departments'>Departments</Link>
          <Link href='/audit-logs'>Audit Logs</Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
