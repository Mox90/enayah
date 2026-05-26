'use client'

import { useAuthStore } from '@/modules/iam/stores/auth.store'

import EmployeeDashboard from './employee-dashboard'
import ManagerDashboard from './manager-dashboard'
import HRAdminDashboard from './hr-admin-dashboard'
import DirectorDashboard from './director-dashboard'
import SystemAdminDashboard from './system-admin-dashboard'

export default function DashboardResolver() {
  const user = useAuthStore((state) => state.user)

  const permissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? []

  // SYSTEM ADMIN
  if (permissions.includes('system.monitor')) {
    return <SystemAdminDashboard />
  }

  // DIRECTOR
  if (permissions.includes('analytics.view')) {
    return <DirectorDashboard />
  }

  // HR ADMIN
  if (permissions.includes('employee.view')) {
    return <HRAdminDashboard />
  }

  // MANAGER
  if (permissions.includes('team.manage')) {
    return <ManagerDashboard />
  }

  // DEFAULT
  return <EmployeeDashboard />
}
