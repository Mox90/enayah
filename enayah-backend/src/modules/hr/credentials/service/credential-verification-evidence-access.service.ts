//evidence-access service

// enayah-backend/src/modules/hr/credentials/service/credential-verification-evidence-access.service.ts

import { AppError } from '../../../../core/errors/AppError'

import { db, type CredentialVerificationCredentialType } from '../../../../db'

import { CredentialVerificationEventRepository } from '../repository/credential-verification-event.repository'

import { resolveCredentialDocument } from './credential-document-storage.service'

export type CredentialVerificationEvidenceAccessResult = {
  eventId: string
  employeeId: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string

  fileId: string
  originalName: string
  mimeType: string
  fileSize: number
  absolutePath: string
}

export async function getCredentialVerificationEvidence({
  employeeId,
  credentialType,
  credentialId,
  eventId,
}: {
  employeeId: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string
  eventId: string
}): Promise<CredentialVerificationEvidenceAccessResult> {
  const evidence =
    await CredentialVerificationEventRepository.findEvidenceForAccess(db, {
      employeeId,
      credentialType,
      credentialId,
      eventId,
    })

  if (!evidence) {
    throw new AppError('Verification evidence document not found.', 404)
  }

  const resolved = await resolveCredentialDocument(evidence.storageKey)

  if (resolved.fileSize !== evidence.fileSize) {
    throw new AppError(
      'Verification evidence file metadata does not match the stored file.',
      500,
    )
  }

  return {
    eventId: evidence.eventId,

    employeeId: evidence.employeeId,

    credentialType: evidence.credentialType,

    credentialId: evidence.credentialId,

    fileId: evidence.fileId,

    originalName: evidence.originalName,

    mimeType: evidence.mimeType,

    fileSize: evidence.fileSize,

    absolutePath: resolved.absolutePath,
  }
}
