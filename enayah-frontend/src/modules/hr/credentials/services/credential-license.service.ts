// enayah-frontend/src/hr/crdentials/services/credential-license.service.ts

import { LicenseStatus } from '@/components/dialogs/license-dialog'
import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export type LicenseWritePayload = {
  authority: string
  licenseNumber: string
  profession: string
  specialty?: string | null
  issueDate?: string | null
  expiryDate: string | null
  //status?: LicenseStatus //'active' | 'expired' | 'suspended' | 'revoked'
  isPrimary: boolean

  /*
   * Always supplied by LicenseDialog as File or null.
   *
   * Using a required nullable property avoids issues with
   * exactOptionalPropertyTypes.
   */
  documentFile: File | null
}

export type CreateLicensePayload = LicenseWritePayload & {
  employeeId: string
}

// export type UpdateLicensePayload = Omit<
//   Partial<CreateLicensePayload>,
//   'employeeId'
// > & { id: string }
export type UpdateLicensePayload = LicenseWritePayload & {
  employeeId: string
  id: string
}

export type DeleteLicensePayload = {
  employeeId: string
  id: string
}

function buildLicenseFormData(payload: LicenseWritePayload): FormData {
  const { documentFile, ...licenseData } = payload

  const formData = new FormData()

  /*
   * This name must match:
   *
   * parseCredentialMultipartBody(
   *   req.body,
   *   'license',
   *   schema,
   * )
   */
  formData.append('license', JSON.stringify(licenseData))

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

export const credentialLicenseService = {
  create: async ({ employeeId, ...payload }: CreateLicensePayload) => {
    const response = await api.post(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/licenses`,
      buildLicenseFormData(payload),
    )

    return response.data
  },

  update: async ({ employeeId, id, ...payload }: UpdateLicensePayload) => {
    const response = await api.patch(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/licenses/${id}`,
      buildLicenseFormData(payload),
    )

    return response.data
  },

  delete: async ({ employeeId, id }: DeleteLicensePayload) => {
    const response = await api.delete(
      `${API_ENDPOINTS.hr.credentials}/employee/${employeeId}/licenses/${id}`,
    )

    return response.data
  },
}
