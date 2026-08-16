import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Form } from 'react-hook-form'

export type MembershipWritePayload = {
  organization: string
  membershipNumber?: string | null
  membershipLevel?: string | null
  startDate?: string | null
  expiryDate?: string | null
  isPrimary?: boolean | false
  isVerified?: boolean | null
  documentFile: File | null
}

export type CreateMembershipPayload = MembershipWritePayload & {
  employeeId: string
}

export type UpdateMembershipPayload = MembershipWritePayload & {
  employeeId: string
  id: string
}

// export type UpdateMembershipPayload = Omit<
//   Partial<CreateMembershipPayload>,
//   'employeeId'
// > & { id: string }

export type DeleteMembershipPayload = {
  employeeId: string
  id: string
}

function buildMembershipFormData(payload: MembershipWritePayload): FormData {
  const { documentFile, ...membershipData } = payload

  const formData = new FormData()

  formData.append('membership', JSON.stringify(membershipData))

  if (documentFile) {
    formData.append('document', documentFile, documentFile.name)
  }

  return formData
}

export const credentialMembershipService = {
  create: async ({ employeeId, ...payload }: CreateMembershipPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/memberships`,
      buildMembershipFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateMembershipPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/memberships/${id}`,
      buildMembershipFormData(payload),
    )
    return response.data
  },

  delete: async ({ employeeId, id }: DeleteMembershipPayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/memberships/${id}`,
    )

    return response.data
  },
}
