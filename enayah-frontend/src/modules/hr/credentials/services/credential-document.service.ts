// enayah-frontend/src/modules/hr/credentials/services/credential-document.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

import type {
  CredentialDocumentAccessRequest,
  CredentialDocumentAccessService,
} from '../types/credential-document.types'
import {
  CREDENTIAL_RESOURCE_SEGMENTS,
  CredentialKind,
} from '../config/credential-resource.config'

type CreateCredentialDocumentServiceOptions = {
  resourceSegment: string
}

export function createCredentialDocumentService({
  resourceSegment,
}: CreateCredentialDocumentServiceOptions): CredentialDocumentAccessService {
  function createEndpoint(
    { employeeId, credentialId }: CredentialDocumentAccessRequest,
    mode: 'preview' | 'download',
  ): string {
    return (
      `${API_ENDPOINTS.hr.credentials}` +
      `/employee/${employeeId}` +
      `/${resourceSegment}/${credentialId}` +
      `/document/${mode}`
    )
  }

  return {
    previewDocument: async (request): Promise<Blob> => {
      const response = await api.get<Blob>(createEndpoint(request, 'preview'), {
        responseType: 'blob',
      })

      return response.data
    },

    downloadDocument: async (request): Promise<Blob> => {
      const response = await api.get<Blob>(
        createEndpoint(request, 'download'),
        {
          responseType: 'blob',
        },
      )

      return response.data
    },
  }
}

export const degreeDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.degree,
})

export const boardDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.board,
})

export const fellowshipDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.fellowship,
})

export const membershipDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.membership,
})

export const licenseDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.license,
})

export const lifeSupportDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS['life-support'],
})

export const malpracticeDocumentService = createCredentialDocumentService({
  resourceSegment: CREDENTIAL_RESOURCE_SEGMENTS.malpractice,
})

export const credentialDocumentServices = {
  degree: degreeDocumentService,
  board: boardDocumentService,
  fellowship: fellowshipDocumentService,
  membership: membershipDocumentService,
  license: licenseDocumentService,
  'life-support': lifeSupportDocumentService,
  malpractice: malpracticeDocumentService,
} as const satisfies Record<
  CredentialKind,
  ReturnType<typeof createCredentialDocumentService>
>

// export const degreeDocumentService = createCredentialDocumentService({
//   resourceSegment: 'degrees',
// })

// export const boardDocumentService = createCredentialDocumentService({
//   resourceSegment: 'boards',
// })

// export const fellowshipDocumentService = createCredentialDocumentService({
//   resourceSegment: 'fellowships',
// })

// export const membershipDocumentService = createCredentialDocumentService({
//   resourceSegment: 'memberships',
// })

// export const licenseDocumentService = createCredentialDocumentService({
//   resourceSegment: 'licenses',
// })

// export const lifeSupportDocumentService = createCredentialDocumentService({
//   resourceSegment: 'life-support',
// })

// export const malpracticeDocumentService = createCredentialDocumentService({
//   resourceSegment: 'malpractice',
// })
