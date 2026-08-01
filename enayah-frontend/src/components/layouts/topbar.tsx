'use client'

import { useTheme } from 'next-themes'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import LanguageSwitcher from './language-switcher'
import { useLocale, useTranslations } from 'next-intl'
import MobileSidebar from './mobile-sidebar'
import { api } from '@/lib/api/client'
import { Link, useRouter } from '../../../i18n/navigation'
import { NotificationBell } from '@/modules/notifications/components/notification-bell'
import { useMyEmployeeProfile } from '@/modules/hr/employees/hooks/use-my-employee-profile'
import { useQueryClient } from '@tanstack/react-query'
//import { router } from 'next/client'

const Topbar = () => {
  const t = useTranslations('common')
  const router = useRouter()
  const locale = useLocale()
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  // const { data: employeeProfile } = useEmployeeProfile(
  //   (user?.employeeId || user?.employee?.id) ?? undefined,
  // )
  const { data: employeeProfile } = useMyEmployeeProfile(user?.id)

  const avatar = employeeProfile?.personal.avatar ?? null
  const logout = useAuthStore((state) => state.logout)
  const { resolvedTheme, setTheme } = useTheme()
  const isRtl = locale === 'ar'

  const handleLogout = async () => {
    try {
      await api.post('/iam/auth/logout')
    } catch (error) {
      console.error(error)
    } finally {
      await queryClient.cancelQueries()
      logout()
      //window.location.href = `/${locale}/login`
      //router.replace(`/${locale}/login`)
      queryClient.clear()
      router.replace(`/login`)
    }
  }

  const fullName = isRtl
    ? user?.employee?.fullNameAr
    : user?.employee?.fullNameEn

  const initials = isRtl
    ? `${user?.employee?.firstNameAr?.slice(0, 1) ?? ''}${
        user?.employee?.familyNameAr?.slice(0, 1) ?? ''
      }`
    : `${user?.employee?.firstNameEn?.slice(0, 1) ?? ''}${
        user?.employee?.familyNameEn?.slice(0, 1) ?? ''
      }`

  const displayInitials = isRtl ? initials : initials.toUpperCase()

  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
      {/* LEFT */}
      <div className='flex items-center gap-3'>
        {/* MOBILE SIDEBAR */}

        <MobileSidebar />

        {/* MOBILE LOGO */}

        <Link href='/dashboard' className='flex items-center lg:hidden'>
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
              isRtl ? 'pr-2' : 'pl-2'
            }`}
          >
            NAFH
          </h1>
        </Link>

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
        {/* <Button variant='ghost' size='icon' aria-label='Notifications'>
          <Bell className='h-5 w-5' />
        </Button> */}
        <NotificationBell />

        {/* PROFILE */}
        <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger>
            <div className='cursor-pointer'>
              <Avatar className='h-10 w-10 border'>
                {avatar && (
                  <AvatarImage
                    src={avatar}
                    alt={fullName || user?.username || 'User'}
                    className='object-cover'
                  />
                )}

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
              <Link href='/my-profile' className='flex w-full items-center'>
                <User className='me-2 h-4 w-4' />
                {t('profile')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href='/settings' className='flex w-full items-center'>
                <Settings className='mr-2 h-4 w-4' />
                {t('settings')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className='text-red-500'>
              <LogOut
                className='mr-2 h-4 w-4'
                style={isRtl ? { transform: 'scaleX(-1)' } : {}}
              />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Topbar
