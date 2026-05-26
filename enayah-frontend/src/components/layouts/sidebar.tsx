'use client'

import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { navigation } from '@/lib/navigation/navigation.config'
import { hasPermission } from '@/lib/permissions/hasPermission'
import NavigationItem from '../navigation/navigation-item'
import { useAuthStore } from '@/modules/iam/stores/auth.store'

const Sidebar = () => {
  const locale = useLocale()
  const t = useTranslations('navigation')

  const user = useAuthStore((state) => state.user)
  const permissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? []

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
        {navigation.map((item) => {
          if (item.permission && !hasPermission(permissions, item.permission)) {
            return null
          }

          return (
            <NavigationItem
              key={item.href}
              href={item.href}
              label={t(item.label)}
              icon={item.icon}
            />
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
