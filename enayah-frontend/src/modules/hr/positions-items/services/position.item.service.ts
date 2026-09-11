// enayah-frontend/src/modules/hr/positions-items/services/position.item.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type { CreateJobPositionItemFormValues } from '../schemas/position.items.schema'
import type {
  PaginatedPositionItems,
  PositionItem,
} from '../types/position.item.types'

export const positionItemService = {
  getPositionItems: async (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedPositionItems> => {
    const response = await api.get(API_ENDPOINTS.hr.positionItems, {
      params,
    })

    return response.data
  },

  findLookup: async (): Promise<PositionItem[]> => {
    const response = await api.get(`${API_ENDPOINTS.hr.positionItems}/lookup`)

    return response.data
  },

  create: async (
    data: CreateJobPositionItemFormValues,
  ): Promise<PositionItem> => {
    const response = await api.post(API_ENDPOINTS.hr.positionItems, data)

    return response.data
  },

  update: async (
    id: string,
    data: CreateJobPositionItemFormValues,
  ): Promise<PositionItem> => {
    const response = await api.put(
      `${API_ENDPOINTS.hr.positionItems}/${id}`,
      data,
    )

    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.hr.positionItems}/${id}`)
  },
}
