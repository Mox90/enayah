import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { CreatePositionFormValues } from '../schemas/position.schema'

export const positionService = {
  getPositions: async (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const response = await api.get(API_ENDPOINTS.org.positions, { params })
    return response.data
  },

  create: async (data: CreatePositionFormValues) => {
    const response = await api.post(API_ENDPOINTS.org.positions, data)
    return response.data
  },

  update: async (id: string, data: CreatePositionFormValues) => {
    const response = await api.put(`${API_ENDPOINTS.org.positions}/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`${API_ENDPOINTS.org.positions}/${id}`)
  },
}
