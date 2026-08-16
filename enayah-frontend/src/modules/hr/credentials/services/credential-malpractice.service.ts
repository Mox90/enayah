import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

// export type CreateMalpracticePayload = {
//   employeeId: string
//   insuranceCompany: string
//   policyNumber: string
//   coverageAmount?: string | number | null
//   startDate?: string | null
//   expiryDate?: string | null
//   documentFileId?: string | null
//   isVerified?: boolean
// }
export type MalpracticeWritePayload = {
  //employeeId: string
  insuranceCompany: string
  policyNumber: string
  coverageAmount?: string | number | null
  startDate?: string | null
  expiryDate?: string | null
  documentFile?: File | null
  //isVerified?: boolean
}

export type CreateMalpracticePayload = MalpracticeWritePayload & {
  employeeId: string
}

export type UpdateMalpracticePayload = MalpracticeWritePayload & {
  employeeId: string
  id: string
}

// export type UpdateMalpracticePayload = Omit<
//   Partial<CreateMalpracticePayload>,
//   'employeeId'
// > & { id: string }

export type deleteMalpracticePayload = {
  employeeId: string
  id: string
}

const buildMalpracticeFormData = (
  payload: MalpracticeWritePayload,
): FormData => {
  const { documentFile, ...malpracticeData } = payload

  const formData = new FormData()

  /*
   * This name must match:
   *
   * parseCredentialMultipartBody(
   *   req.body,
   *   'malpractice',
   *   schema,
   * )
   */
  formData.append('malpractice', JSON.stringify(malpracticeData))

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

export const credentialMalpracticeService = {
  create: async ({ employeeId, ...payload }: CreateMalpracticePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/malpractice`,
      buildMalpracticeFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateMalpracticePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/malpractice/${id}`,
      buildMalpracticeFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: deleteMalpracticePayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/malpractice/${id}`,
    )

    return response.data
  },
}
