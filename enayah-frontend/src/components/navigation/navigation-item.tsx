'use client'

import type { LucideIcon } from 'lucide-react'

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

  const isActive =
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-12 w-full items-center gap-3',
        'rounded-s-none rounded-e-2xl',
        'ps-6 pe-4 py-3',
        'text-sm font-medium',
        'transition-colors duration-150',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={onClick}
    >
      <Icon className='h-5 w-5 shrink-0' />

      <span className='min-w-0 truncate'>{label}</span>
    </Link>
  )
}

export default NavigationItem

// 'use client'

// import type { LucideIcon } from 'lucide-react'

// import { cn } from '@/lib/utils'
// import { Link, usePathname } from '../../../i18n/navigation'

// interface NavigationItemProps {
//   href: string
//   label: string
//   icon: LucideIcon
//   onClick?: () => void
// }

// const NavigationItem = ({
//   href,
//   label,
//   icon: Icon,
//   onClick,
// }: NavigationItemProps) => {
//   const pathname = usePathname()

//   const isActive =
//     pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

//   return (
//     <Link
//       href={href}
//       className={cn(
//         'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
//         isActive
//           ? 'bg-primary text-primary-foreground shadow-sm'
//           : 'text-muted-foreground hover:bg-muted hover:text-foreground',
//       )}
//       onClick={onClick}
//     >
//       <Icon className='h-5 w-5 shrink-0' />

//       <span className='truncate'>{label}</span>
//     </Link>
//   )
// }

// export default NavigationItem
