import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateFellowshipPayload = {
  employeeId: string
  fellowshipName: string
  abbreviation?: string | null
  issuingBody: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  isVerified: boolean
  documentFileId?: string | null
}

export type UpdateFellowshipPayload = Omit<
  Partial<CreateFellowshipPayload>,
  'employeeId'
> & { id: string }

export const credentialFellowshipService = {
  create: async ({ employeeId, ...body }: CreateFellowshipPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/fellowships`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateFellowshipPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/fellowships/${id}`,
      body,
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/fellowships/${id}`,
    )

    return response.data
  },
}
