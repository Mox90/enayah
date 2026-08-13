import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type LifeSupportWritePayload = {
  //employeeId: string
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
  //isVerified?: boolean
  documentFile?: File | null
}

export type CreateLifeSupportPayload = LifeSupportWritePayload & {
  employeeId: string
}

export type UpdateLifeSupportPayload = LifeSupportWritePayload & {
  employeeId: string
  id: string
}

export type DeleteLifeSupportPayload = {
  employeeId: string
  id: string
}

// export type UpdateLifeSupportPayload = Omit<
//   Partial<CreateLifeSupportPayload>,
//   'employeeId'
// > & { id: string }

function buildLifeSupportFormData(payload: LifeSupportWritePayload): FormData {
  const { documentFile, ...lifeSupportData } = payload

  const formData = new FormData()

  /*
   * This name must match:
   *
   * parseCredentialMultipartBody(
   *   req.body,
   *   'life-support',
   *   schema,
   * )
   */
  formData.append('life_support', JSON.stringify(lifeSupportData))

  /*
   * This name must match:
   *
   * upload.single('document')
   */
  if (documentFile) {
    formData.append('document', documentFile, documentFile.name)
  }

  return formData
}

export const credentialLifeSupportService = {
  create: async ({ employeeId, ...payload }: CreateLifeSupportPayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/life-support`,
      buildLifeSupportFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateLifeSupportPayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/life-support/${employeeId}/life-support/${id}`,
      buildLifeSupportFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: DeleteLifeSupportPayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/life-support/${id}`,
    )

    return response.data
  },
}
