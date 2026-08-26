// enayah-frontend/src/modules/hr/iqama-renewal/services/iqama-renewal.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type { ApiResponse } from '../../dashboard/types/hr-dashboard.types'
import type {
  AssigneeOption,
  ChangeIqamaRenewalStatusPayload,
  CompleteIqamaRenewalPayload,
  CreateIqamaRenewalCasePayload,
  IqamaRenewalCase,
  IqamaRenewalCaseListResponse,
  IqamaRenewalStatus,
  ReturnIqamaRenewalToHrPayload,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'

export const IQAMA_RENEWAL_SORT_FIELDS = [
  'employeeNumber',
  'employeeName',
  'iqamaNumber',
  'expiryDate',
  'status',
  'mhrsdUploadedAt',
  'mhrsdApprovedAt',
  'mhrsdDeniedAt',
  'mhrsdDecision',
  'governmentRelationsDueDate',
  'daysRemaining',
  'createdAt',
  'updatedAt',
] as const

export type IqamaRenewalSortBy = (typeof IQAMA_RENEWAL_SORT_FIELDS)[number]

export function isIqamaRenewalSortBy(
  value: string,
): value is IqamaRenewalSortBy {
  return (IQAMA_RENEWAL_SORT_FIELDS as readonly string[]).includes(value)
}

export interface ListIqamaRenewalProcessesParams {
  page?: number
  limit?: number
  search?: string

  status?: IqamaRenewalStatus[]

  expiryDateFrom?: string | null
  expiryDateTo?: string | null

  mhrsdUploadedFrom?: string | null
  mhrsdUploadedTo?: string | null

  mhrsdApprovedFrom?: string | null
  mhrsdApprovedTo?: string | null

  mhrsdDeniedFrom?: string | null
  mhrsdDeniedTo?: string | null

  governmentRelationsDueFrom?: string | null
  governmentRelationsDueTo?: string | null

  sortBy?: IqamaRenewalSortBy
  sortOrder?: 'asc' | 'desc'
}

export const iqamaRenewalService = {
  // list: async (
  //   params: IqamaRenewalListParams,
  // ): Promise<IqamaRenewalCaseListResponse> => {
  //   const response = await api.get<IqamaRenewalCaseListResponse>(
  //     API_ENDPOINTS.hr.iqamaRenewal,
  //     {
  //       params: {
  //         page: params.page,
  //         limit: params.limit,
  //         search: params.search?.trim() || undefined,
  //         status: params.status || undefined,
  //         sortBy: params.sortBy || undefined,
  //         sortOrder: params.sortOrder || undefined,
  //       },
  //     },
  //   )

  //   return response.data
  // },

  list: async (
    params: ListIqamaRenewalProcessesParams,
  ): Promise<IqamaRenewalCaseListResponse> => {
    const { status, ...rest } = params

    const requestParams = {
      ...rest,
      status: status && status.length > 0 ? status.join(',') : undefined,
    }

    //console.log('IQAMA RENEWAL LIST PARAMS:', requestParams)

    const response = await api.get(API_ENDPOINTS.hr.iqamaRenewal, {
      params: requestParams,
    })

    return response.data
  },

  findById: async (id: string): Promise<IqamaRenewalCase> => {
    const response = await api.get<IqamaRenewalCase>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}`,
    )

    return response.data
  },

  create: async (
    payload: CreateIqamaRenewalCasePayload,
  ): Promise<IqamaRenewalCase> => {
    const response = await api.post<IqamaRenewalCase>(
      API_ENDPOINTS.hr.iqamaRenewal,
      payload,
    )

    return response.data
  },

  update: async (
    id: string,
    payload: UpdateIqamaRenewalCasePayload,
  ): Promise<IqamaRenewalCase> => {
    const response = await api.patch<IqamaRenewalCase>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}`,
      payload,
    )

    return response.data
  },

  changeIqamaRenewalStatus: async (
    id: string,
    payload: ChangeIqamaRenewalStatusPayload,
  ): Promise<IqamaRenewalCase> => {
    const response = await api.patch<IqamaRenewalCase>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}/status`,
      payload,
    )

    return response.data
  },

  getGovernmentRelationsUsers: async (): Promise<AssigneeOption[]> => {
    const response = await api.get<AssigneeOption[]>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/assignees/government-relations`,
    )

    return response.data
  },

  completeIqamaRenewal: async (
    id: string,
    payload: CompleteIqamaRenewalPayload,
  ): Promise<IqamaRenewalCase> => {
    const response = await api.patch<ApiResponse<IqamaRenewalCase>>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}/complete`,
      payload,
    )

    return response.data.data
  },

  returnToHr: async (
    id: string,
    payload: ReturnIqamaRenewalToHrPayload,
  ): Promise<IqamaRenewalCase> => {
    const response = await api.patch<ApiResponse<IqamaRenewalCase>>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}/return-to-hr`,
      payload,
    )

    return response.data.data
  },
}
