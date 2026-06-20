import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateMalpracticePayload = {
  employeeId: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate?: string | null
  documentFileId?: string | null
  isVerified?: boolean
}

export type UpdateMalpracticePayload = Omit<
  Partial<CreateMalpracticePayload>,
  'employeeId'
> & { id: string }

export const credentialMalpracticeService = {
  create: async ({ employeeId, ...body }: CreateMalpracticePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/malpractice`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateMalpracticePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/malpractice/${id}`,
      body,
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/malpractice/${id}`,
    )

    return response.data
  },
}
