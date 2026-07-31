// enayah-frontend/src/modules/iam/component/auth/auth-provider.tsx

'use client'

import { useEffect } from 'react'

import { bootstrapAuth } from '../../services/auth-bootstrap'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    bootstrapAuth()
  }, [])

  return children
}
