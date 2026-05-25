'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '../../../i18n/navigation'
import { useAuthStore } from '@/modules/iam/stores/auth.store'

export default function HomePage() {
  const router = useRouter()

  const locale = useLocale()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router, locale])

  return (
    <div className='flex h-screen items-center justify-center'>
      <p className='text-sm text-muted-foreground'>Redirecting...</p>
    </div>
  )
}
