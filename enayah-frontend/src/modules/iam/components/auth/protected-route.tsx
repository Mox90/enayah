'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '../../stores/auth.store'
import { usePermissionStore } from '../../stores/permission.store'
import { useLocale } from 'next-intl'

interface Props {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
}: Props) {
  const router = useRouter()
  const locale = useLocale()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const permissions = usePermissionStore((state) => state.permissions)

  const isHydrated = useAuthStore((s) => s.isHydrated)

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      //router.push(`/${locale}/login`)
      router.replace(`/${locale}/login`)
      return
    }

    if (
      requiredPermissions.length > 0 &&
      !requiredPermissions.every((p) => permissions.includes(p))
    ) {
      router.push('/forbidden')
    }
  }, [
    locale,
    isAuthenticated,
    permissions,
    requiredPermissions,
    router,
    isHydrated,
  ])

  if (!isHydrated) return null

  if (!isAuthenticated) return null

  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((p) => permissions.includes(p))
  )
    return null
  return <>{children}</>
}
