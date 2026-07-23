// enayah-frontend/src/modules/hr/dashboard/service/hr-dashboard.service.ts

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { api } from '@/lib/api/client'

import type {
  ApiResponse,
  HrAdminDashboardData,
} from '../types/hr-dashboard.types'

export async function getHrAdminDashboard(
  year: number,
): Promise<HrAdminDashboardData> {
  const response = await api.get<ApiResponse<HrAdminDashboardData>>(
    API_ENDPOINTS.hr.dashboard.admin,
    {
      params: {
        year,
      },
    },
  )

  return response.data.data
}
