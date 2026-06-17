// src/modules/hr/onboarding/services/position-item-lookup.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface PositionItemLookupParams {
  search?: string
  limit?: number
}

export interface PositionItemLookupItem {
  id: string
  itemNumber: string

  departmentId: string
  departmentNameEn: string | null
  departmentNameAr: string | null

  positionId: string
  positionTitleEn: string | null
  positionTitleAr: string | null

  categoryCode: number | null
  workforceCategory: string | null

  minSalary: string | null
  maxSalary: string | null

  status: string
}

export interface PositionItemLookupResponse {
  items: PositionItemLookupItem[]
}

export const positionItemLookupService = {
  lookup: async (
    params: PositionItemLookupParams,
  ): Promise<PositionItemLookupResponse> => {
    const response = await api.get(`${API_ENDPOINTS.hr.positionItems}/lookup`, {
      params,
    })

    return response.data
  },
}
