//shared verification types
// enayah-backend/src/modules/hr/credentials/types/credential-verification.types.ts

import { z } from 'zod'
import type {
  CredentialVerificationAction,
  CredentialVerificationCredentialType,
} from '../../../../db'

export type CredentialVerificationEvidenceMetadata = {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
}

export type CredentialVerificationActorSummary = {
  id: string
  displayName: string
}

export type CredentialVerificationEventSummary = {
  id: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string
  action: CredentialVerificationAction
  remarks: string | null
  performedAt: Date
  performedBy: CredentialVerificationActorSummary
  evidenceDocument: CredentialVerificationEvidenceMetadata | null
}

export type CredentialVerificationMetadata = {
  isVerified: boolean
  verifiedAt: Date | null
  remarks: string | null
  verifiedBy: CredentialVerificationActorSummary | null
  evidenceDocument: CredentialVerificationEvidenceMetadata | null
  latestEvent: CredentialVerificationEventSummary | null
}
