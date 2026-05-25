//import { ProtectedRoute } from '@/components/auth/protected-route'
//import ProtectedRoute from '@/components/auth/protected-route'
import AppShell from '@/components/layout/app-shell'
//import DashboardShell from '@/components/layout/dashboard-shell'
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
