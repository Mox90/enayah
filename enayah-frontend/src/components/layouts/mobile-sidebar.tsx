// enayah-frontend/src/components/layouts/mobile-sidebar.tsx

'use client'

import Image from 'next/image'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useLocale, useTranslations } from 'next-intl'
import { navigation } from '@/lib/navigation/navigation.config'
import { hasPermission } from '@/lib/permissions/hasPermission'
import NavigationItem from '../navigation/navigation-item'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { Link } from '../../../i18n/navigation'
import { useState } from 'react'

const MobileSidebar = () => {
  const locale = useLocale()
  const t = useTranslations('navigation')
  const [open, setOpen] = useState(false)

  const user = useAuthStore((state) => state.user)
  const permissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? []

  return (
    <Sheet key={locale} open={open} onOpenChange={setOpen}>
      {/* <SheetTrigger className='lg:hidden'> */}
      <SheetTrigger className='lg:hidden' aria-label='Open navigation menu'>
        <span className='sr-only'>Open navigation menu</span>
        <Menu className='h-6 w-6' />
      </SheetTrigger>

      <SheetContent
        side={locale === 'ar' ? 'right' : 'left'}
        className='w-64 p-0'
      >
        <SheetHeader className='sr-only'>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Main application navigation links.
          </SheetDescription>
        </SheetHeader>
        {/* HEADER */}
        <Link
          href='/dashboard'
          className='flex h-16 items-center border-b px-6'
        >
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
            NAFH
          </h1>
        </Link>

        {/* NAVIGATION */}
        <nav className='space-y-2 p-4'>
          {navigation.map((item) => {
            if (
              item.permission &&
              !hasPermission(permissions, item.permission)
            ) {
              return null
            }

            return (
              <NavigationItem
                key={item.href}
                href={item.href}
                label={t(item.label)}
                icon={item.icon}
                onClick={() => setOpen(false)}
              />
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
