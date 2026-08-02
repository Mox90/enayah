//event repository
// enayah-backend/src/modules/hr/credentials/repository/credential-verification-event.repository.ts

import { and, desc, eq, isNull } from 'drizzle-orm'

import {
  credentialVerificationEvents,
  files,
  users,
  type CredentialVerificationAction,
  type CredentialVerificationCredentialType,
  type DB,
} from '../../../../db'

const VERIFICATION_EVIDENCE_FILE_CATEGORY =
  'credential_verification_evidence' as const

export type CreateCredentialVerificationEventInput = {
  employeeId: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string
  action: CredentialVerificationAction
  remarks: string | null
  evidenceFileId: string | null
  performedByUserId: string
  performedAt: Date
}

export type CredentialVerificationEvidenceAccessRecord = {
  eventId: string
  employeeId: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string

  fileId: string
  originalName: string
  mimeType: string
  fileSize: number
  storageKey: string
}

export type LatestCredentialVerificationEventRecord = {
  id: string
  employeeId: string
  credentialType: CredentialVerificationCredentialType
  credentialId: string
  action: CredentialVerificationAction
  remarks: string | null
  performedAt: Date

  performedBy: {
    id: string
    displayName: string
  }

  evidenceDocument: {
    id: string
    originalName: string
    mimeType: string
    fileSize: number
  } | null
}

export const CredentialVerificationEventRepository = {
  create: async (tx: DB, input: CreateCredentialVerificationEventInput) => {
    const event = await tx
      .insert(credentialVerificationEvents)
      .values({
        employeeId: input.employeeId,
        credentialType: input.credentialType,
        credentialId: input.credentialId,
        action: input.action,
        remarks: input.remarks,
        evidenceFileId: input.evidenceFileId,
        performedByUserId: input.performedByUserId,
        performedAt: input.performedAt,
      })
      .returning()

    return event[0] ?? null
  },

  findEvidenceForAccess: async (
    tx: DB,
    input: {
      employeeId: string
      credentialType: CredentialVerificationCredentialType
      credentialId: string
      eventId: string
    },
  ): Promise<CredentialVerificationEvidenceAccessRecord | null> => {
    const [record] = await tx
      .select({
        eventId: credentialVerificationEvents.id,
        employeeId: credentialVerificationEvents.employeeId,
        credentialType: credentialVerificationEvents.credentialType,
        credentialId: credentialVerificationEvents.credentialId,

        fileId: files.id,
        originalName: files.originalName,
        mimeType: files.mimeType,
        fileSize: files.fileSize,
        storageKey: files.storageKey,
      })
      .from(credentialVerificationEvents)
      .innerJoin(
        files,
        and(
          eq(files.id, credentialVerificationEvents.evidenceFileId),
          eq(files.category, VERIFICATION_EVIDENCE_FILE_CATEGORY),
          eq(files.visibility, 'private'),
          eq(files.isDeleted, false),
          isNull(files.deletedAt),
        ),
      )
      .where(
        and(
          eq(credentialVerificationEvents.id, input.eventId),
          eq(credentialVerificationEvents.employeeId, input.employeeId),
          eq(credentialVerificationEvents.credentialType, input.credentialType),
          eq(credentialVerificationEvents.credentialId, input.credentialId),
        ),
      )
      .limit(1)

    return record ?? null
  },

  /*
   * Returns events newest-first.
   *
   * The response service keeps the first event for each
   * credentialType + credentialId pair.
   */
  findForEmployee: async (
    tx: DB,
    employeeId: string,
  ): Promise<LatestCredentialVerificationEventRecord[]> => {
    const rows = await tx
      .select({
        id: credentialVerificationEvents.id,
        employeeId: credentialVerificationEvents.employeeId,
        credentialType: credentialVerificationEvents.credentialType,
        credentialId: credentialVerificationEvents.credentialId,
        action: credentialVerificationEvents.action,
        remarks: credentialVerificationEvents.remarks,
        performedAt: credentialVerificationEvents.performedAt,

        performedBy: {
          id: users.id,

          /*
           * Use your existing display-name projection here when available.
           * Username is a safe fallback and requires no employee-profile join.
           */
          displayName: users.username,
        },

        evidenceDocument: {
          id: files.id,
          originalName: files.originalName,
          mimeType: files.mimeType,
          fileSize: files.fileSize,
        },
      })
      .from(credentialVerificationEvents)
      .innerJoin(
        users,
        eq(users.id, credentialVerificationEvents.performedByUserId),
      )
      .leftJoin(
        files,
        and(
          eq(files.id, credentialVerificationEvents.evidenceFileId),
          eq(files.category, VERIFICATION_EVIDENCE_FILE_CATEGORY),
          eq(files.visibility, 'private'),
          eq(files.isDeleted, false),
          isNull(files.deletedAt),
        ),
      )
      .where(eq(credentialVerificationEvents.employeeId, employeeId))
      .orderBy(
        desc(credentialVerificationEvents.performedAt),
        desc(credentialVerificationEvents.id),
      )

    return rows.map((row) => ({
      ...row,

      evidenceDocument: row.evidenceDocument?.id ? row.evidenceDocument : null,
    }))
  },
}
