import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { CreatePositionFormValues } from '../schemas/position.schema'
import { Position } from '../types/position.types'

export const positionService = {
  getPositions: async (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const response = await api.get(API_ENDPOINTS.hr.positions, { params })
    return response.data
  },

  findLookup: async () => {
    const response = await api.get<Position[]>(
      `${API_ENDPOINTS.hr.positions}/lookup`,
    )
    return response.data
  },

  create: async (data: CreatePositionFormValues) => {
    const response = await api.post(API_ENDPOINTS.hr.positions, data)
    return response.data
  },

  update: async (id: string, data: CreatePositionFormValues) => {
    const response = await api.put(`${API_ENDPOINTS.hr.positions}/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`${API_ENDPOINTS.hr.positions}/${id}`)
  },
}
