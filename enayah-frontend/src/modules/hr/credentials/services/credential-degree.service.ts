// enayah-frontend/src/modules/hr/credentials/services/credential-degree.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type DegreeType =
  | 'diploma'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'doctorate'
  | 'other'

export type DegreeWritePayload = {
  degreeType: DegreeType
  degreeName: string
  major: string | null
  institution: string
  graduationDate: string | null

  /*
   * Always supplied by DegreeDialog as File or null.
   *
   * Using a required nullable property avoids issues with
   * exactOptionalPropertyTypes.
   */
  documentFile: File | null
}

export type CreateDegreePayload = DegreeWritePayload & {
  employeeId: string
}

export type UpdateDegreePayload = DegreeWritePayload & {
  employeeId: string
  id: string
}

export type DeleteDegreePayload = {
  employeeId: string
  id: string
}

function buildDegreeFormData(payload: DegreeWritePayload): FormData {
  const { documentFile, ...degreeData } = payload

  const formData = new FormData()

  /*
   * This name must match:
   *
   * parseCredentialMultipartBody(
   *   req.body,
   *   'degree',
   *   schema,
   * )
   */
  formData.append('degree', JSON.stringify(degreeData))

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

export const credentialDegreeService = {
  create: async ({ employeeId, ...payload }: CreateDegreePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees`,
      buildDegreeFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateDegreePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees/${id}`,
      buildDegreeFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: DeleteDegreePayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/degrees/${id}`,
    )

    return response.data
  },
}
