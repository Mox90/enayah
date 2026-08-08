// enayah-frontend/src/modules/hr/credentials/services/credential-verification.service.ts

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type {
  CredentialVerificationUpdateResponse,
  UpdateCredentialVerificationRequest,
} from '../types/credential-verification.types'
import { api } from '@/lib/api/client'
import {
  CREDENTIAL_RESOURCE_SEGMENTS,
  CredentialKind,
  type CredentialResourceSegment,
} from '../config/credential-resource.config'

type CreateCredentialVerificationServiceOptions = {
  /*
   * Backend route segment:
   *
   * degree → degrees
   * board → boards
   * license → licenses
   */
  resourceSegment: CredentialResourceSegment
}

type CredentialVerificationEvidenceRequest = {
  employeeId: string
  credentialId: string
  eventId: string
}

type EvidenceAccessMode = 'preview' | 'download'

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
    ...(remarks !== undefined ? { remarks: normalizedRemarks } : {}),
  }
}

export function createCredentialVerificationService({
  resourceSegment,
}: CreateCredentialVerificationServiceOptions) {
  const getEvidenceBlob = async ({
    employeeId,
    credentialId,
    eventId,
    mode,
  }: CredentialVerificationEvidenceRequest & {
    mode: EvidenceAccessMode
  }): Promise<Blob> => {
    const endpoint =
      `${API_ENDPOINTS.hr.credentials}` +
      `/employee/${employeeId}` +
      `/${resourceSegment}/${credentialId}` +
      `/verification/events/${eventId}` +
      `/evidence/${mode}`

    const response = await api.get<Blob>(endpoint, {
      responseType: 'blob',
    })

    return response.data
  }

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
        ...(remarks !== undefined ? { remarks } : {}),
      })

      /*
       * Use JSON when no verification evidence is attached.
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

    previewEvidence: async (
      request: CredentialVerificationEvidenceRequest,
    ): Promise<Blob> => {
      return getEvidenceBlob({
        ...request,
        mode: 'preview',
      })
    },

    downloadEvidence: async (
      request: CredentialVerificationEvidenceRequest,
    ): Promise<Blob> => {
      return getEvidenceBlob({
        ...request,
        mode: 'download',
      })
    },
  }
}

/*
 * Configured verification services for each
 * supported credential domain.
 */
export const degreeVerificationService = createCredentialVerificationService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.degree,
})

export const boardVerificationService = createCredentialVerificationService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.board,
})

export const fellowshipVerificationService =
  createCredentialVerificationService({
    resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.fellowship,
  })

export const membershipVerificationService =
  createCredentialVerificationService({
    resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.membership,
  })

export const licenseVerificationService = createCredentialVerificationService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.license,
})

export const lifeSupportVerificationService =
  createCredentialVerificationService({
    resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS['life-support'],
  })

export const malpracticeVerificationService =
  createCredentialVerificationService({
    resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.malpractice,
  })

export const credentialVerificationServices = {
  degree: degreeVerificationService,
  board: boardVerificationService,
  fellowship: fellowshipVerificationService,
  membership: membershipVerificationService,
  license: licenseVerificationService,
  'life-support': lifeSupportVerificationService,
  malpractice: malpracticeVerificationService,
} as const satisfies Record<
  CredentialKind,
  ReturnType<typeof createCredentialVerificationService>
>

export type CredentialVerificationService = ReturnType<
  typeof createCredentialVerificationService
>

// export const degreeVerificationService = createCredentialVerificationService({
//   resourceSegment: 'degrees',
// })

// export const boardVerificationService = createCredentialVerificationService({
//   resourceSegment: 'boards',
// })

// export const fellowshipVerificationService =
//   createCredentialVerificationService({
//     resourceSegment: 'fellowships',
//   })

// export const membershipVerificationService =
//   createCredentialVerificationService({
//     resourceSegment: 'memberships',
//   })

// export const licenseVerificationService = createCredentialVerificationService({
//   resourceSegment: 'licenses',
// })

// export const lifeSupportVerificationService =
//   createCredentialVerificationService({
//     resourceSegment: 'life-support',
//   })

// export const malpracticeVerificationService =
//   createCredentialVerificationService({
//     resourceSegment: 'malpractice',
//   })
