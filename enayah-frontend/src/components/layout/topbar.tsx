'use client'

import { useTheme } from 'next-themes'
import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Bell, Globe, Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import LanguageSwitcher from './language-switcher'

const Topbar = () => {
  const user = useAuthStore((state) => state.user)

  const logout = useAuthStore((state) => state.logout)

  //const { theme, setTheme } = useTheme()

  //const [mounted, setMounted] = useState(false)

  //useEffect(() => {
  //  setMounted(true)
  //}, [])
  const { resolvedTheme, setTheme } = useTheme()
  const handleLogout = () => {
    logout()

    window.location.href = '/login'
  }

  const initials = user?.employee?.fullNameEn
    ? `${user?.employee?.firstNameEn.slice(0, 1).toUpperCase()}${user?.employee?.familyNameEn.slice(0, 1).toUpperCase()}`
    : user?.username?.slice(0, 2).toUpperCase() || 'US'

  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
      {/* LEFT */}
      <div>
        <h1 className='text-lg font-semibold'>Dashboard</h1>
      </div>

      {/* RIGHT */}
      <div className='flex items-center gap-2'>
        {/* Notifications */}
        <Button variant='ghost' size='icon'>
          <Bell className='h-5 w-5' />
        </Button>

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

        {/* PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className='cursor-pointer'>
              <Avatar className='h-10 w-10 border'>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56'>
            <div className='px-3 py-2'>
              <p className='text-sm font-medium'>
                {user?.employee?.fullNameEn || user?.username}
              </p>

              <p className='text-xs text-muted-foreground'>{user?.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className='mr-2 h-4 w-4' />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className='text-red-500'>
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Topbar
