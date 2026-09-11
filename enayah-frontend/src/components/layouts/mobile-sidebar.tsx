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
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const MobileSidebar = () => {
  const locale = useLocale()
  const t = useTranslations('navigation')
  const [open, setOpen] = useState(false)

  const user = useAuthStore((state) => state.user)
  const permissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? []
  const logo1Ref = useRef<HTMLDivElement>(null)
  const logo2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const logo1 = logo1Ref.current
    const logo2 = logo2Ref.current

    if (!logo1 || !logo2) return

    // Initial state
    gsap.set(logo1, { opacity: 1 })
    gsap.set(logo2, { opacity: 0 })

    let showingFirstLogo = true

    const interval = window.setInterval(() => {
      const timeline = gsap.timeline()

      if (showingFirstLogo) {
        timeline
          .to(logo1, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          })
          .to(
            logo2,
            {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.inOut',
            },
            '<',
          )
      } else {
        timeline
          .to(logo2, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          })
          .to(
            logo1,
            {
              opacity: 1,
              duration: 1.2,
              ease: 'power2.inOut',
            },
            '<',
          )
      }

      showingFirstLogo = !showingFirstLogo
    }, 60_000)

    return () => {
      window.clearInterval(interval)
      gsap.killTweensOf([logo1, logo2])
    }
  }, [])

  return (
    <Sheet key={locale} open={open} onOpenChange={setOpen}>
      {/* <SheetTrigger className='lg:hidden'> */}
      <SheetTrigger className='lg:hidden' aria-label='Open navigation menu'>
        <span className='sr-only'>Open navigation menu</span>
        <Menu className='h-6 w-6' />
      </SheetTrigger>

      <SheetContent
        side={locale === 'ar' ? 'right' : 'left'}
        className='data-[side=left]:w-[85vw] data-[side=right]:w-[85vw] data-[side=left]:sm:w-[300px] data-[side=right]:sm:w-[300px] data-[side=left]:sm:max-w-[300px] data-[side=right]:sm:max-w-[300px] p-0'
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
          {/* <Image
            src='/MODHS3.png'
            alt='MODHS Logo'
            width={45}
            height={45}
            className='h-auto w-auto rounded-full object-contain'
            priority
          /> */}
          <div className='relative size-10 shrink-0'>
            <div ref={logo1Ref} className='absolute inset-0'>
              <Image
                src='/MODHS3.png'
                alt='MODHS Logo'
                width={36}
                height={36}
                className='h-auto w-auto rounded-full object-contain'
                priority
              />
            </div>

            <div ref={logo2Ref} className='absolute inset-0 opacity-0'>
              <Image
                src='/MODHS.jpg'
                alt=''
                width={36}
                height={36}
                className='h-auto w-auto rounded-full object-contain'
              />
            </div>
          </div>

          <h1
            className={`truncate text-3xl font-bold ${
              locale === 'ar' ? 'pr-2.5' : 'pl-2.5'
            }`}
          >
            NAFH
          </h1>
        </Link>

        {/* NAVIGATION */}
        <nav className='space-y-2 p-4 pe-4'>
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
