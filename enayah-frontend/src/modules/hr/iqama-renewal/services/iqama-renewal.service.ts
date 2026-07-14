// src/modules/hr/iqama-renewal/services/iqama-renewal.service.ts

import { api } from '@/lib/api/client'

import type {
  ChangeIqamaRenewalStatusPayload,
  CreateIqamaRenewalCasePayload,
  IqamaRenewalCase,
  IqamaRenewalCaseListResponse,
  IqamaRenewalStatus,
  UpdateIqamaRenewalCasePayload,
} from '../types/iqama-renewal.types'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type IqamaRenewalSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'governmentRelationsDueDate'

export type IqamaRenewalListParams = {
  page: number
  limit: number
  search?: string
  status?: IqamaRenewalStatus | ''
  sortBy?: IqamaRenewalSortBy
  sortOrder?: 'asc' | 'desc'
}

export const iqamaRenewalService = {
  list: async (
    params: IqamaRenewalListParams,
  ): Promise<IqamaRenewalCaseListResponse> => {
    const response = await api.get<IqamaRenewalCaseListResponse>(
      API_ENDPOINTS.hr.iqamaRenewal,
      {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search || undefined,
          status: params.status || undefined,
          sortBy: params.sortBy || undefined,
          sortOrder: params.sortOrder || undefined,
        },
      },
    )

    //console.log('FROM Service', response.data)
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
  ) => {
    const response = await api.patch<IqamaRenewalCase>(
      `${API_ENDPOINTS.hr.iqamaRenewal}/${id}/status`,
      payload,
    )

    return response.data
  },
}
