import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateBoardPayload = {
  employeeId: string
  boardName: string
  specialty?: string | null
  issuingBody: string
  issueDate?: string | null
  expiryDate?: string | null
  isLifetime?: boolean
  isVerified?: boolean | false
}

export type UpdateBoardPayload = Partial<CreateBoardPayload> & {
  id: string
}

export const credentialBoardService = {
  create: async ({ employeeId, ...body }: CreateBoardPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/boards`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateBoardPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/boards/${id}`,
      body,
    )

    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/boards/${id}`,
    )

    return response.data
  },
}
