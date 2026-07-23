// enayah-frontend/src/modules/hr/dashboard/hooks/use-hr-admin-dashboard.ts

import { useQuery } from '@tanstack/react-query'
import { getHrAdminDashboard } from '../service/hr-dashboard.service'

export const hrDashboardKeys = {
  all: ['hr-dashboard'] as const,

  admin: (year: number) => [...hrDashboardKeys.all, 'admin', year] as const,
}

export function useHrAdminDashboard(year: number) {
  return useQuery({
    queryKey: hrDashboardKeys.admin(year),
    queryFn: () => getHrAdminDashboard(year),
    enabled: Number.isInteger(year) && year > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
