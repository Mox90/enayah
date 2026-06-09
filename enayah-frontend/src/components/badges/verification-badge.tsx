// components/common/verification-badge.tsx

import { Badge } from '@/components/ui/badge'

const verificationClass: Record<string, string> = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  unverified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

interface Props {
  verified: boolean
}

export function VerificationBadge({ verified }: Props) {
  const status = verified ? 'verified' : 'unverified'

  return (
    <Badge variant='outline' className={verificationClass[status]}>
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}
