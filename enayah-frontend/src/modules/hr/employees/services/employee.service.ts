//import { api } from '@/lib/api'
import { api } from '@/lib/api/client'
//import { PaginatedResponse } from '@/types/pagination'
import { Employee, EmployeeListResponse } from '../types/employee-view.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { DepartmentHierarchyNode } from '../types/employee-hierarchy.types'

//import { Employee } from '../types/employee.types'

export const employeeService = {
  /*async getEmployees(params: {
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
  },*/

  getEmployeesByRange: async (params: {
    offset: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const response = await api.get<EmployeeListResponse>(
      `${API_ENDPOINTS.hr.employees}`,
      {
        params,
      },
    )
    return response.data
  },

  /*getOrganizationView: async (): Promise<OrganizationNode[]> => {
    const response = await api.get(`${API_ENDPOINTS.hr.positionItems}/org-view`)
    return response.data
  },*/

  getOrganizationTreeView: async (): Promise<DepartmentHierarchyNode[]> => {
    const response = await api.get(`${API_ENDPOINTS.org.departments}/tree`)
    return response.data
  },

  getManpowerView: async () => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.positionItems}/manpower-view`,
    )
    return response.data
  },
}
