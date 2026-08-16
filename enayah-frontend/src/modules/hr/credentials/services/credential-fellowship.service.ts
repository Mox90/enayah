import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

// export type CreateFellowshipPayload = {
//   employeeId: string
//   fellowshipName: string
//   abbreviation?: string | null
//   issuingBody: string
//   specialty?: string | null
//   issueDate?: string | null
//   expiryDate?: string | null
//   isVerified: boolean
//   documentFileId?: string | null
// }

export type FellowshipWritePayload = {
  fellowshipName: string
  abbreviation?: string | null
  issuingBody: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  documentFile: File | null
}

export type CreateFellowshipPayload = FellowshipWritePayload & {
  employeeId: string
}

// export type UpdateFellowshipPayload = Omit<
//   Partial<CreateFellowshipPayload>,
//   'employeeId'
// > & { id: string }
export type UpdateFellowshipPayload = FellowshipWritePayload & {
  employeeId: string
  id: string
}

export type DeleteFellowshipPayload = {
  employeeId: string
  id: string
}

function buildFellowshipFormData(payload: FellowshipWritePayload): FormData {
  const { documentFile, ...fellowshipData } = payload

  const formData = new FormData()

  formData.append('fellowship', JSON.stringify(fellowshipData))

  if (documentFile) {
    formData.append('document', documentFile, documentFile.name)
  }

  return formData
}

export const credentialFellowshipService = {
  create: async ({ employeeId, ...payload }: CreateFellowshipPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/fellowships`,
      buildFellowshipFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateFellowshipPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/fellowships/${id}`,
      buildFellowshipFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: DeleteFellowshipPayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/fellowships/${id}`,
    )

    return response.data
  },
}
