//import { api } from '@/lib/api'
import { api } from '@/lib/api/client'
//import { PaginatedResponse } from '@/types/pagination'
//import { Employee, EmployeeListResponse } from '../types/employee-view.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  EmployeeDirectoryParams,
  EmployeeDirectoryResponse,
} from '../types/employee-directory.types'
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '../types/employee-request.types'
import { Employee } from '../types/employee.types'
import { EmployeeProfile } from '../types/employee-profile.types'
import { EmployeePersonalDetails } from '../types/employee-personal-details.types'

//import { Employee } from '../types/employee.types'

export const employeeService = {
  //----------------------------------
  // Paginated EMployees
  //----------------------------------
  getDirectory: async (
    params: EmployeeDirectoryParams,
  ): Promise<EmployeeDirectoryResponse> => {
    const response = await api.get(API_ENDPOINTS.hr.employees, { params })
    return response.data
  },

  //----------------------------------
  // Employee Master Record
  //----------------------------------

  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get(`${API_ENDPOINTS.hr.employees}/${id}`)
    return response.data
  },

  //----------------------------------
  // Employee Profile
  //----------------------------------

  getProfile: async (id: string): Promise<EmployeeProfile> => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.employees}/${id}/profile`,
    )

    return response.data
  },

  getPersonal: async (id: string): Promise<EmployeePersonalDetails> => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.employees}/${id}/personal`,
    )

    return response.data
  },

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const response = await api.post(API_ENDPOINTS.hr.employees, dto)

    return response.data
  },

  //----------------------------------
  // Update
  //----------------------------------

  update: async (id: string, dto: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.put(`${API_ENDPOINTS.hr.employees}/${id}`, dto)

    return response.data
  },

  //----------------------------------
  // Soft Delete
  //----------------------------------

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.hr.employees}/${id}`)
  },

  /*getEmployeesByRange: async (params: {
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

  getEmployeeDirectory: async (params: EmployeeDirectoryParams) => {
    const response = await api.get<EmployeeDirectoryResponse>(
      `${API_ENDPOINTS.hr.employees}/directory`,
      {
        params,
      },
    )
    return response.data
  },

  getEmployeeProfile: async (id: string): Promise<EmployeeProfile> => {
    const response = await api.get(
      `${API_ENDPOINTS.hr.employees}/${id}/profile`,
    )
    return response.data
  },*/
}
