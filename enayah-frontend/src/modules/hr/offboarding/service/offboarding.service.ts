// enayah-frontend/src/modules/hr/offboarding/services/offboarding.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type {
  CreateSeparationPayload,
  EmploymentSeparation,
  UpdateSeparationPayload,
} from '../types/offboarding.types'

const base = API_ENDPOINTS.hr.offboarding

export const offboardingService = {
  getByEmploymentId: async (
    employmentId: string,
  ): Promise<EmploymentSeparation[]> => {
    const response = await api.get(
      `${base}/employments/${employmentId}/separations`,
    )

    return response.data
  },

  getById: async (separationId: string): Promise<EmploymentSeparation> => {
    const response = await api.get(`${base}/separations/${separationId}`)

    return response.data
  },

  create: async (
    employmentId: string,
    payload: CreateSeparationPayload,
  ): Promise<EmploymentSeparation> => {
    const response = await api.post(
      `${base}/employments/${employmentId}/separations`,
      payload,
    )

    return response.data
  },

  update: async (
    separationId: string,
    payload: UpdateSeparationPayload,
  ): Promise<EmploymentSeparation> => {
    const response = await api.patch(
      `${base}/separations/${separationId}`,
      payload,
    )

    return response.data
  },

  submit: async (separationId: string): Promise<EmploymentSeparation> => {
    const response = await api.post(
      `${base}/separations/${separationId}/submit`,
    )

    return response.data
  },

  approve: async (separationId: string): Promise<EmploymentSeparation> => {
    const response = await api.post(
      `${base}/separations/${separationId}/approve`,
    )

    return response.data
  },

  cancel: async (separationId: string): Promise<EmploymentSeparation> => {
    const response = await api.post(
      `${base}/separations/${separationId}/cancel`,
    )

    return response.data
  },

  complete: async (separationId: string) => {
    const response = await api.post(
      `${base}/separations/${separationId}/complete`,
    )

    return response.data
  },
}
