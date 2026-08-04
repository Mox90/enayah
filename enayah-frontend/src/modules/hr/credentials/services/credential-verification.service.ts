// enayah-frontend/src/modules/hr/credentials/services/credential-verification.service.ts

// import { API_ENDPOINTS } from '@/config/api-endpoints'
// import { api } from '@/lib/api'

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  CredentialVerificationUpdateResponse,
  UpdateCredentialVerificationRequest,
} from '../types/credential-verification.types'
import { api } from '@/lib/api/client'

type CreateCredentialVerificationServiceOptions = {
  /*
   * Backend route segment:
   *
   * degree → degrees
   * board → boards
   * license → licenses
   */
  resourceSegment: string
}

type VerificationBody = {
  isVerified: boolean
  remarks?: string | null
}

function createVerificationBody({
  isVerified,
  remarks,
}: {
  isVerified: boolean
  remarks?: string | null
}): VerificationBody {
  const normalizedRemarks = remarks?.trim() || null

  return {
    isVerified,

    /*
     * Preserve exactOptionalPropertyTypes compatibility.
     */
    ...(remarks !== undefined
      ? {
          remarks: normalizedRemarks,
        }
      : {}),
  }
}

export function createCredentialVerificationService({
  resourceSegment,
}: CreateCredentialVerificationServiceOptions) {
  return {
    updateVerification: async ({
      employeeId,
      credentialId,
      isVerified,
      remarks,
      evidenceFile,
    }: UpdateCredentialVerificationRequest): Promise<CredentialVerificationUpdateResponse> => {
      const endpoint =
        `${API_ENDPOINTS.hr.credentials}` +
        `/employee/${employeeId}` +
        `/${resourceSegment}/${credentialId}` +
        '/verification'

      const verification = createVerificationBody({
        isVerified,

        ...(remarks !== undefined
          ? {
              remarks,
            }
          : {}),
      })

      /*
       * Continue using JSON when no evidence is attached.
       */
      if (!evidenceFile) {
        const response = await api.patch<CredentialVerificationUpdateResponse>(
          endpoint,
          verification,
        )

        return response.data
      }

      /*
       * Evidence requires multipart/form-data.
       */
      const formData = new FormData()

      formData.append('verification', JSON.stringify(verification))

      formData.append('evidence', evidenceFile)

      const response = await api.patch<CredentialVerificationUpdateResponse>(
        endpoint,
        formData,
      )

      return response.data
    },
  }
}

/*
 * Degree-specific configured service.
 *
 * Other credential domains will reuse the same factory later.
 */
export const degreeVerificationService = createCredentialVerificationService({
  resourceSegment: 'degrees',
})
