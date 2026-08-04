// enayah-frontend/src/modules/hr/credentials/types/credential-verification.types.ts

import type { CredentialDocumentMetadata } from './credential-document.types'

export type CredentialVerificationAction = 'verified' | 'revoked'

export type CredentialVerificationCredentialType =
  | 'degree'
  | 'board'
  | 'fellowship'
  | 'membership'
  | 'license'
  | 'life_support'
  | 'malpractice'

export type CredentialVerificationActorSummary = {
  id: string
  displayName: string
}

/*
 * The verification evidence has the same safe metadata
 * structure as the original credential document.
 */
export type CredentialVerificationEvidenceMetadata = CredentialDocumentMetadata

export type CredentialVerificationEventSummary = {
  id: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string
  action: CredentialVerificationAction
  remarks: string | null
  performedAt: string

  performedBy: CredentialVerificationActorSummary

  evidenceDocument: CredentialVerificationEvidenceMetadata | null
}

export type CredentialVerificationMetadata = {
  isVerified: boolean
  verifiedAt: string | null
  remarks: string | null

  verifiedBy: CredentialVerificationActorSummary | null

  evidenceDocument: CredentialVerificationEvidenceMetadata | null

  latestEvent: CredentialVerificationEventSummary | null
}

export type UpdateCredentialVerificationRequest = {
  employeeId: string
  credentialId: string
  isVerified: boolean
  remarks?: string | null
  evidenceFile?: File
}

export type CredentialVerificationUpdateResponse = {
  id: string
  employeeId: string
  isVerified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  verificationRemarks: string | null

  verificationEvent: {
    id: string

    credentialType: CredentialVerificationCredentialType

    credentialId: string
    action: CredentialVerificationAction
    remarks: string | null
    performedAt: string
    performedByUserId: string

    evidenceDocument: CredentialVerificationEvidenceMetadata | null
  }
}
