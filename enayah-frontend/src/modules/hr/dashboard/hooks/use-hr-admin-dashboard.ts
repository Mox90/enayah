// enayah-frontend/src/modules/hr/dashboard/hooks/use-hr-admin-dashboard.ts

import { useQuery } from '@tanstack/react-query'

import {
  getHrAdminDashboardActivity,
  getHrAdminDashboardSummary,
} from '../service/hr-dashboard.service'

export const hrDashboardKeys = {
  all: ['hr-dashboard'] as const,
  admin: () => [...hrDashboardKeys.all, 'admin'] as const,
  summary: () => [...hrDashboardKeys.admin(), 'summary'] as const,
  activity: (year: number) =>
    [...hrDashboardKeys.admin(), 'activity', year] as const,
}

export function useHrAdminDashboardSummary() {
  return useQuery({
    queryKey: hrDashboardKeys.summary(),
    queryFn: getHrAdminDashboardSummary,
    // Current-state KPI cards don't need to
    // refetch whenever the user changes year.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useHrAdminDashboardActivity(year: number) {
  return useQuery({
    queryKey: hrDashboardKeys.activity(year),
    queryFn: () => getHrAdminDashboardActivity(year),
    enabled: Number.isInteger(year) && year > 0,
    // Historical activity changes much less
    // frequently than the current-state summary.
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
