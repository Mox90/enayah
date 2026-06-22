import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateLifeSupportPayload = {
  employeeId: string
  type:
    | 'bls'
    | 'acls'
    | 'pals'
    | 'atls'
    | 'stls'
    | 'nrp'
    | 'itls'
    | 'blso'
    | 'atcn'
    | 'also'
    | 'tncc'
    | 'enpc'
    | 'asls'
    | 'esls'
    | 'pfccs'
    | 'other'
  provider: string
  certificateNumber?: string | null
  issueDate?: string | null
  expiryDate: string
  isVerified?: boolean
  documentFileId?: string | null
}

export type UpdateLifeSupportPayload = Omit<
  Partial<CreateLifeSupportPayload>,
  'employeeId'
> & { id: string }

export const credentialLifeSupportService = {
  create: async ({ employeeId, ...body }: CreateLifeSupportPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/life-support`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateLifeSupportPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/life-support/${id}`,
      body,
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/life-support/${id}`,
    )

    return response.data
  },
}
