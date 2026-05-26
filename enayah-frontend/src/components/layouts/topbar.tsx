'use client'

import { useTheme } from 'next-themes'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Bell, Globe, Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import LanguageSwitcher from './language-switcher'
import { useLocale, useTranslations } from 'next-intl'
import MobileSidebar from './mobile-sidebar'
import { api } from '@/lib/api/client'

const Topbar = () => {
  const t = useTranslations('common')
  const locale = useLocale()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { resolvedTheme, setTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await api.post('/iam/auth/logout')
    } catch (error) {
      console.error(error)
    } finally {
      logout()
      window.location.href = `/${locale}/login`
    }
  }

  const fullName =
    locale === 'ar' ? user?.employee?.fullNameAr : user?.employee?.fullNameEn

  const initials =
    locale === 'ar'
      ? `${user?.employee?.firstNameAr?.slice(0, 1) ?? ''}${
          user?.employee?.familyNameAr?.slice(0, 1) ?? ''
        }`
      : `${user?.employee?.firstNameEn?.slice(0, 1) ?? ''}${
          user?.employee?.familyNameEn?.slice(0, 1) ?? ''
        }`

  const displayInitials = locale === 'ar' ? initials : initials.toUpperCase()

  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
      {/* LEFT */}
      <div className='flex items-center gap-3'>
        {/* MOBILE SIDEBAR */}

        <MobileSidebar />

        {/* MOBILE LOGO */}

        <div className='flex items-center lg:hidden'>
          <Image
            src='/MODHS3.png'
            alt='MODHS Logo'
            width={36}
            height={36}
            className='h-auto w-auto rounded-full object-contain'
            priority
          />

          <h1
            className={`hidden min-[370px]:block truncate text-2xl font-bold ${
              locale === 'ar' ? 'pr-2' : 'pl-2'
            }`}
          >
            ENYH
          </h1>
        </div>

        {/* DESKTOP PAGE TITLE */}
        <h1 className='hidden text-lg font-semibold lg:block'>Dashboard</h1>
      </div>

      {/* RIGHT */}
      <div className='flex items-center gap-2'>
        {/* Language */}
        <LanguageSwitcher />

        {/* Theme */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
        </Button>

        {/* Notifications */}
        <Button variant='ghost' size='icon' aria-label='Notifications'>
          <Bell className='h-5 w-5' />
        </Button>

        {/* PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className='cursor-pointer'>
              <Avatar className='h-10 w-10 border'>
                <AvatarFallback>{displayInitials || 'US'}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56'>
            <div className='px-3 py-2'>
              <p className='text-sm font-medium'>
                {fullName || user?.username}
              </p>

              <p className='text-xs text-muted-foreground'>{user?.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className='mr-2 h-4 w-4' />
              {t('profile')}
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className='mr-2 h-4 w-4' />
              {t('settings')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className='text-red-500'>
              <LogOut className='mr-2 h-4 w-4' />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Topbar
