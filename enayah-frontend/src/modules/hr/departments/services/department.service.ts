import { api } from '@/lib/api/client'
import { CreateDepartmentFormValues } from '../schemas/department.schema'
import { Department } from '../types/department.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export const departmentService = {
  findAll: async () => {
    const response = await api.get<Department[]>(API_ENDPOINTS.org.departments)
    return response.data
  },

  create: async (data: CreateDepartmentFormValues) => {
    const response = await api.post(API_ENDPOINTS.org.departments, data)
    return response.data
  },
}
