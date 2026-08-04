//evidence preparation and cleanup
// enayah-backend/src/modules/hr/credentials/service/credential-verification-evidence.service.ts

import {
  processCredentialDocument,
  type ProcessedCredentialDocument,
} from './credential-document-processing.service'

import {
  removeCredentialDocumentByAbsolutePath,
  storeCredentialDocument,
  type StoredCredentialDocument,
} from './credential-document-storage.service'

export type PreparedCredentialVerificationEvidence = {
  processed: ProcessedCredentialDocument
  stored: StoredCredentialDocument
}

export async function prepareCredentialVerificationEvidence(
  file: Express.Multer.File,
): Promise<PreparedCredentialVerificationEvidence> {
  const processed = await processCredentialDocument(file)

  const stored = await storeCredentialDocument({
    document: processed,
    originalName: file.originalname,
    credentialKind: 'verification-evidence',
  })

  return {
    processed,
    stored,
  }
}

export async function cleanUpCredentialVerificationEvidence(
  preparedEvidence: PreparedCredentialVerificationEvidence | null,
): Promise<void> {
  if (!preparedEvidence) {
    return
  }

  await removeCredentialDocumentByAbsolutePath(
    preparedEvidence.stored.absolutePath,
  ).catch((cleanupError: unknown) => {
    console.error(
      'Unable to clean up credential verification evidence:',
      cleanupError,
    )
  })
}
