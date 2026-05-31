import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { CreateJobPositionItemFormValues } from '../schemas/position.items.schema'
import { PositionItem } from '../types/position.item.types'

export const positionItemService = {
  getPositionItems: async (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const response = await api.get(API_ENDPOINTS.hr.positionItems, { params })
    return response.data
  },

  findLookup: async () => {
    const response = await api.get<PositionItem[]>(
      `${API_ENDPOINTS.hr.positionItems}/lookup`,
    )
    return response.data
  },

  create: async (data: CreateJobPositionItemFormValues) => {
    const response = await api.post(API_ENDPOINTS.hr.positionItems, data)
    return response.data
  },

  update: async (id: string, data: CreateJobPositionItemFormValues) => {
    const response = await api.put(
      `${API_ENDPOINTS.hr.positionItems}/${id}`,
      data,
    )
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`${API_ENDPOINTS.hr.positionItems}/${id}`)
  },
}
