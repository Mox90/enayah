import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateMembershipPayload = {
  employeeId: string
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null
  isPrimary?: boolean | false
  isVerified?: boolean | false
  documentFileId?: string | null
}

export type UpdateMembershipPayload = Omit<
  Partial<CreateMembershipPayload>,
  'employeeId'
> & { id: string }

export const credentialMembershipService = {
  create: async ({ employeeId, ...body }: CreateMembershipPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/memberships`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateMembershipPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/memberships/${id}`,
      body,
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/memberships/${id}`,
    )

    return response.data
  },
}
