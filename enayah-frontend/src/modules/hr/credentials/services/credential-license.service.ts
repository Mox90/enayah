import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type CreateLicensePayload = {
  employeeId: string
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'revoked'
  isPrimary: boolean | false
}

export type UpdateLicensePayload = Omit<
  Partial<CreateLicensePayload>,
  'employeeId'
> & { id: string }

export const credentialLicenseService = {
  create: async ({ employeeId, ...body }: CreateLicensePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/licenses`,
      body,
    )

    return response.data
  },

  update: async ({ id, ...body }: UpdateLicensePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/licenses/${id}`,
      body,
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/licenses/${id}`,
    )

    return response.data
  },
}
