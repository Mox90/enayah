import { api } from '@/lib/api/client'
import { CreateDepartmentFormValues } from '../schemas/department.schema'
import { Department } from '../types/department.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { number } from 'zod'

export const departmentService = {
  findAll: async () => {
    const response = await api.get<Department[]>(API_ENDPOINTS.org.departments)
    return response.data
  },

  getDepartments: async (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    //console.log('API PARAMS', params)
    const response = await api.get(API_ENDPOINTS.org.departments, { params })
    return response.data
  },

  create: async (data: CreateDepartmentFormValues) => {
    const response = await api.post(API_ENDPOINTS.org.departments, data)
    return response.data
  },

  update: async (id: string, data: CreateDepartmentFormValues) => {
    const response = await api.put(
      `${API_ENDPOINTS.org.departments}/${id}`,
      data,
    )
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`${API_ENDPOINTS.org.departments}/${id}`)
  },
}
