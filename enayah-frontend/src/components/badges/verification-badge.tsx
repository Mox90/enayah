// components/common/verification-badge.tsx

import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const verificationConfig = {
  verified: {
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800',
    icon: CheckCircle2,
  },
  unverified: {
    className:
      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800',
    icon: AlertCircle,
  },
} as const

interface Props {
  verified: boolean
}

export function VerificationBadge({ verified }: Props) {
  const ct = useTranslations('credentials')
  const status = verified ? 'verified' : 'unverified'
  const config = verificationConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant='outline'
      className={`flex items-center gap-1.5 font-medium ${config.className}`}
    >
      <Icon className='h-3.5 w-3.5' />
      {ct(status)}
    </Badge>
  )
}

// import { Badge } from '@/components/ui/badge'
// import { useTranslations } from 'next-intl'

// const verificationClass: Record<string, string> = {
//   verified: 'bg-green-100 text-green-700 border-green-200',
//   unverified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
// }

// interface Props {
//   verified: boolean
// }

// export function VerificationBadge({ verified }: Props) {
//   const ct = useTranslations('credentials')
//   const status = verified ? 'verified' : 'unverified'

//   return (
//     <Badge variant='outline' className={verificationClass[status]}>
//       {ct(status)}
//     </Badge>
//   )
// }
