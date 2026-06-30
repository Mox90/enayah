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
import { CreateIdentificationDto } from '../types/employee-personal.dto'

//import { Employee } from '../types/employee.types'
const base = `${API_ENDPOINTS.hr.employees}/personal`

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
    //console.log('data is')
    //console.log(response.data)
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
    //console.log('ID >>>>>> ' + id)
    //console.log(dto)
    const response = await api.patch(`${API_ENDPOINTS.hr.employees}/${id}`, dto)

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
  // ------------------------------------------------------------------
  // IDENTIFICATIONS
  // ------------------------------------------------------------------

  createIdentification: async (
    employeeId: string,
    data: CreateIdentificationDto,
  ) => {
    const { ...payload } = data
    const response = await api.post(`${base}/${employeeId}`, {
      identifications: [payload],
    })
    return response.data
  },

  updateIdentification: async (id: string, data: unknown) =>
    api.patch(`${base}/identifications/${id}`, data),

  deleteIdentification: async (id: string) =>
    api.delete(`${base}/identifications/${id}`),

  // ------------------------------------------------------------------

  // PHONE NUMBERS

  // ------------------------------------------------------------------

  createPhone: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/phones`, data),

  updatePhone: async (id: string, data: unknown) =>
    api.patch(`${base}/phones/${id}`, data),

  deletePhone: async (id: string) => api.delete(`${base}/phones/${id}`),

  // ------------------------------------------------------------------

  // EMAILS

  // ------------------------------------------------------------------

  createEmail: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/emails`, data),

  updateEmail: async (id: string, data: unknown) =>
    api.patch(`${base}/emails/${id}`, data),

  deleteEmail: async (id: string) => api.delete(`${base}/emails/${id}`),

  // ------------------------------------------------------------------

  // ADDRESSES

  // ------------------------------------------------------------------

  createAddress: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/addresses`, data),

  updateAddress: async (id: string, data: unknown) =>
    api.patch(`${base}/addresses/${id}`, data),

  deleteAddress: async (id: string) => api.delete(`${base}/addresses/${id}`),

  // ------------------------------------------------------------------

  // DEPENDENTS

  // ------------------------------------------------------------------

  createDependent: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/dependents`, data),

  updateDependent: async (id: string, data: unknown) =>
    api.patch(`${base}/dependents/${id}`, data),

  deleteDependent: async (id: string) => api.delete(`${base}/dependents/${id}`),

  // ------------------------------------------------------------------

  // EMERGENCY CONTACTS

  // ------------------------------------------------------------------

  createEmergencyContact: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/emergency-contacts`, data),

  updateEmergencyContact: async (id: string, data: unknown) =>
    api.patch(`${base}/emergency-contacts/${id}`, data),

  deleteEmergencyContact: async (id: string) =>
    api.delete(`${base}/emergency-contacts/${id}`),

  // ------------------------------------------------------------------

  // VISAS

  // ------------------------------------------------------------------

  createVisa: async (employeeId: string, data: unknown) =>
    api.post(`${base}/${employeeId}/visas`, data),

  updateVisa: async (id: string, data: unknown) =>
    api.patch(`${base}/visas/${id}`, data),

  deleteVisa: async (id: string) => api.delete(`${base}/visas/${id}`),
}
