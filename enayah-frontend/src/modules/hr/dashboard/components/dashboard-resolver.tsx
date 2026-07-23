// enayah-frontend/src/modules/hr/dashboard/components/dashboard-resolver.tsx

'use client'

import { useAuthStore } from '@/modules/iam/stores/auth.store'

import EmployeeDashboard from './employee-dashboard'
import ManagerDashboard from './manager-dashboard'
import HRAdminDashboard from './hr-admin-dashboard'
import DirectorDashboard from './director-dashboard'
import SystemAdminDashboard from './system-admin-dashboard'
import { PERMISSIONS } from '@/constants/permissions'

export default function DashboardResolver() {
  const user = useAuthStore((state) => state.user)

  const permissions =
    user?.roles?.flatMap((role) =>
      role.permissions.map((permission) => permission.code),
    ) ?? []

  // SYSTEM ADMIN
  if (permissions.includes(PERMISSIONS.SYSTEM_MONITOR)) {
    return <SystemAdminDashboard />
  }

  // DIRECTOR
  if (permissions.includes(PERMISSIONS.ANALYTICS_VIEW)) {
    return <DirectorDashboard />
  }

  // HR ADMIN
  if (permissions.includes(PERMISSIONS.EMPLOYEE_VIEW)) {
    return <HRAdminDashboard />
  }

  // MANAGER
  if (permissions.includes(PERMISSIONS.TEAM_MANAGE)) {
    return <ManagerDashboard />
  }

  // DEFAULT
  return <EmployeeDashboard />
}
