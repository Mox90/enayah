'use client'

import { LucideIcon } from 'lucide-react'

//import { Link, usePathname } from '@/i18n/navigation'

import { cn } from '@/lib/utils'
import { Link, usePathname } from '../../../i18n/navigation'

interface NavigationItemProps {
  href: string
  label: string
  icon: LucideIcon
  onClick?: () => void
}

const NavigationItem = ({
  href,
  label,
  icon: Icon,
  onClick,
}: NavigationItemProps) => {
  const pathname = usePathname()

  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={onClick}
    >
      <Icon className='h-5 w-5 shrink-0' />

      <span className='truncate'>{label}</span>
    </Link>
  )
}

export default NavigationItem
