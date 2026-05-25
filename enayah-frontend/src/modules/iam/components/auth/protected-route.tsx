'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '../../stores/auth.store'
import { usePermissionStore } from '../../stores/permission.store'

interface Props {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
}: Props) {
  const router = useRouter()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const permissions = usePermissionStore((state) => state.permissions)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (
      requiredPermissions.length > 0 &&
      !requiredPermissions.every((p) => permissions.includes(p))
    ) {
      router.push('/forbidden')
    }
  }, [isAuthenticated, permissions, requiredPermissions, router])

  if (!isAuthenticated) return null
  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((p) => permissions.includes(p))
  )
    return null
  return <>{children}</>
}
