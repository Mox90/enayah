//import { api } from '@/lib/api'
import { api } from '@/lib/api/client'
import { PaginatedResponse } from '@/types/pagination'
import { Employee } from '../types/employee-view.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

//import { Employee } from '../types/employee.types'

export const employeeService = {
  async getEmployees(params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const response = await api.get<PaginatedResponse<Employee>>(
      `${API_ENDPOINTS.hr.employees}`,
      {
        params,
      },
    )

    return response.data
  },
}
