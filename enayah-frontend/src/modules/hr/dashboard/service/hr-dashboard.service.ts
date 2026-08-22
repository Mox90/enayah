// enayah-frontend/src/modules/hr/dashboard/service/hr-dashboard.service.ts

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { api } from '@/lib/api/client'

import type {
  ApiResponse,
  HrAdminDashboardActivityData,
  HrAdminDashboardSummaryData,
} from '../types/hr-dashboard.types'

export async function getHrAdminDashboardSummary(): Promise<HrAdminDashboardSummaryData> {
  const response = await api.get<ApiResponse<HrAdminDashboardSummaryData>>(
    `${API_ENDPOINTS.hr.dashboard.admin}/summary`,
  )

  return response.data.data
}

export async function getHrAdminDashboardActivity(
  year: number,
): Promise<HrAdminDashboardActivityData> {
  const response = await api.get<ApiResponse<HrAdminDashboardActivityData>>(
    `${API_ENDPOINTS.hr.dashboard.admin}/activity`,
    {
      params: {
        year,
      },
    },
  )

  return response.data.data
}
