//generic verification service

// enayah-backend/src/modules/hr/credentials/service/credential-verification.service.ts

import { AppError } from '../../../../core/errors/AppError'

import {
  db,
  type CredentialVerificationCredentialType,
  type DB,
} from '../../../../db'

import type { UpdateCredentialVerificationDto } from '../dto/credential.request'

import { CredentialVerificationEventRepository } from '../repository/credential-verification-event.repository'

import {
  CredentialRepository,
  type CredentialFileCategory,
} from '../repository/credential.repository'

import type { CredentialVerificationWriteInput } from '../repository/credential-verification.repository'

import {
  cleanUpCredentialVerificationEvidence,
  prepareCredentialVerificationEvidence,
  type PreparedCredentialVerificationEvidence,
} from './credential-verification-evidence.service'

const VERIFICATION_EVIDENCE_FILE_CATEGORY: CredentialFileCategory =
  'credential_verification_evidence'

type CredentialDocumentRepositoryPort = {
  findForDocumentUpdate: (
    tx: DB,
    employeeId: string,
    credentialId: string,
  ) => Promise<unknown | null>

  findActiveDocument: (
    tx: DB,
    employeeId: string,
    credentialId: string,
  ) => Promise<unknown | null>
}

type CredentialVerificationRepositoryPort<
  TResult extends Record<string, unknown>,
> = {
  updateVerification: (
    tx: DB,
    employeeId: string,
    credentialId: string,
    input: CredentialVerificationWriteInput,
  ) => Promise<TResult | null>
}

export type UpdateCredentialVerificationInput = {
  employeeId: string
  credentialId: string
  actorUserId: string
  data: UpdateCredentialVerificationDto
  evidence?: Express.Multer.File
}

export async function updateCredentialVerification<
  TResult extends Record<string, unknown>,
>({
  documentRepository,
  verificationRepository,
  credentialType,
  credentialLabel,
  employeeId,
  credentialId,
  actorUserId,
  data,
  evidence,
}: {
  documentRepository: CredentialDocumentRepositoryPort

  verificationRepository: CredentialVerificationRepositoryPort<TResult>

  credentialType: CredentialVerificationCredentialType

  credentialLabel: string

  employeeId: string
  credentialId: string
  actorUserId: string
  data: UpdateCredentialVerificationDto
  evidence?: Express.Multer.File
}) {
  let preparedEvidence: PreparedCredentialVerificationEvidence | null = null

  try {
    if (evidence) {
      preparedEvidence = await prepareCredentialVerificationEvidence(evidence)
    }

    return await db.transaction(async (tx) => {
      /*
       * This locks the concrete credential row.
       * Verification and document replacement cannot race.
       */
      const existingCredential = await documentRepository.findForDocumentUpdate(
        tx,
        employeeId,
        credentialId,
      )

      if (!existingCredential) {
        throw new AppError(`${credentialLabel} not found.`, 404)
      }

      /*
       * An active original credential document is required
       * when changing the state to verified.
       */
      if (data.isVerified) {
        const activeDocument = await documentRepository.findActiveDocument(
          tx,
          employeeId,
          credentialId,
        )

        if (!activeDocument) {
          throw new AppError(
            `An active ${credentialLabel.toLowerCase()} document is required before verification.`,
            422,
          )
        }
      }

      const occurredAt = new Date()

      const remarks = data.remarks?.trim() || null

      let evidenceFile: {
        id: string
        originalName: string
        mimeType: string
        fileSize: number
      } | null = null

      if (preparedEvidence) {
        const fileRecord = await CredentialRepository.createCredentialFile(tx, {
          storedName: preparedEvidence.stored.storedName,
          originalName: preparedEvidence.stored.originalName,
          mimeType: preparedEvidence.processed.mimeType,
          fileSize: preparedEvidence.processed.fileSize,
          storageKey: preparedEvidence.stored.storageKey,
          checksumSha256: preparedEvidence.processed.checksumSha256,
          category: VERIFICATION_EVIDENCE_FILE_CATEGORY,
          uploadedByUserId: actorUserId,
        })

        evidenceFile = {
          id: fileRecord.id,
          originalName: preparedEvidence.stored.originalName,
          mimeType: preparedEvidence.processed.mimeType,
          fileSize: preparedEvidence.processed.fileSize,
        }
      }

      const updatedCredential = await verificationRepository.updateVerification(
        tx,
        employeeId,
        credentialId,
        {
          isVerified: data.isVerified,
          remarks,
          actorUserId,
          occurredAt,
        },
      )

      if (!updatedCredential) {
        throw new AppError(`${credentialLabel} not found.`, 404)
      }

      const event = await CredentialVerificationEventRepository.create(tx, {
        employeeId,
        credentialType,
        credentialId,
        action: data.isVerified ? 'verified' : 'revoked',
        remarks,
        evidenceFileId: evidenceFile?.id ?? null,
        performedByUserId: actorUserId,
        performedAt: occurredAt,
      })

      if (!event) {
        throw new AppError(
          'Unable to create the credential verification event.',
          500,
        )
      }

      /*
       * Preserve the existing top-level credential response while
       * adding the event created by this operation.
       */
      return {
        ...updatedCredential,

        verificationEvent: {
          id: event.id,
          credentialType: event.credentialType,
          credentialId: event.credentialId,
          action: event.action,
          remarks: event.remarks,
          performedAt: event.performedAt,
          performedByUserId: event.performedByUserId,
          evidenceDocument: evidenceFile,
        },
      }
    })
  } catch (error: unknown) {
    /*
     * The database transaction may roll back, but bytes were stored
     * before the transaction. Remove those newly stored bytes.
     */
    await cleanUpCredentialVerificationEvidence(preparedEvidence)

    throw error
  }
}
