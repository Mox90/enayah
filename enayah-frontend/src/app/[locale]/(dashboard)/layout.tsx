import AppShell from '@/components/layouts/app-shell'
import ProtectedRoute from '@/modules/iam/components/auth/protected-route'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default Layout
