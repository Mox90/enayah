//response enrichment service
// enayah-backend/src/modules/hr/credentials/service/credential-verification-response.service.ts
import type { CredentialVerificationCredentialType } from '../../../../db'
import { CredentialVerificationMetadata } from '../dto/credential-verification.types'

import type { LatestCredentialVerificationEventRecord } from '../repository/credential-verification-event.repository'

type CredentialVerificationSnapshot = {
  id: string
  isVerified?: boolean | null
  verifiedAt?: Date | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

function createEventKey(
  credentialType: CredentialVerificationCredentialType,
  credentialId: string,
): string {
  return `${credentialType}:${credentialId}`
}

function createLatestEventMap(
  events: LatestCredentialVerificationEventRecord[],
): Map<string, LatestCredentialVerificationEventRecord> {
  const map = new Map<string, LatestCredentialVerificationEventRecord>()

  /*
   * Repository results are newest-first.
   * Keep only the first event for each credential.
   */
  for (const event of events) {
    const key = createEventKey(event.credentialType, event.credentialId)

    if (!map.has(key)) {
      map.set(key, event)
    }
  }

  return map
}

function enrichCredentialCollection<
  TCredential extends CredentialVerificationSnapshot,
>(
  credentialType: CredentialVerificationCredentialType,

  credentials: TCredential[],

  eventMap: Map<string, LatestCredentialVerificationEventRecord>,
): Array<
  TCredential & {
    verification: CredentialVerificationMetadata
  }
> {
  return credentials.map((credential) => {
    const latestEvent =
      eventMap.get(createEventKey(credentialType, credential.id)) ?? null

    const isVerified = credential.isVerified ?? false

    const latestEventMatchesCurrentVerification =
      isVerified &&
      latestEvent?.action === 'verified' &&
      latestEvent.performedBy.id === credential.verifiedBy

    return {
      ...credential,

      verification: {
        isVerified,

        verifiedAt: credential.verifiedAt ?? null,

        remarks: credential.verificationRemarks ?? null,

        verifiedBy: latestEventMatchesCurrentVerification
          ? latestEvent.performedBy
          : null,

        evidenceDocument: latestEventMatchesCurrentVerification
          ? latestEvent.evidenceDocument
          : null,

        latestEvent: latestEvent
          ? {
              id: latestEvent.id,

              credentialType: latestEvent.credentialType,

              credentialId: latestEvent.credentialId,

              action: latestEvent.action,

              remarks: latestEvent.remarks,

              performedAt: latestEvent.performedAt,

              performedBy: latestEvent.performedBy,

              evidenceDocument: latestEvent.evidenceDocument,
            }
          : null,
      },
    }
  })
}

type EmployeeCredentialCollections = {
  degrees: CredentialVerificationSnapshot[]
  boards: CredentialVerificationSnapshot[]
  fellowships: CredentialVerificationSnapshot[]
  memberships: CredentialVerificationSnapshot[]
  licenses: CredentialVerificationSnapshot[]
  lifeSupport: CredentialVerificationSnapshot[]
  malpractice: CredentialVerificationSnapshot[]
}

export function enrichEmployeeCredentialsWithVerification<
  TCredentials extends EmployeeCredentialCollections,
>(
  credentials: TCredentials,
  events: LatestCredentialVerificationEventRecord[],
) {
  const eventMap = createLatestEventMap(events)

  return {
    ...credentials,

    degrees: enrichCredentialCollection(
      'degree',
      credentials.degrees,
      eventMap,
    ),

    boards: enrichCredentialCollection('board', credentials.boards, eventMap),

    fellowships: enrichCredentialCollection(
      'fellowship',
      credentials.fellowships,
      eventMap,
    ),

    memberships: enrichCredentialCollection(
      'membership',
      credentials.memberships,
      eventMap,
    ),

    licenses: enrichCredentialCollection(
      'license',
      credentials.licenses,
      eventMap,
    ),

    lifeSupport: enrichCredentialCollection(
      'life_support',
      credentials.lifeSupport,
      eventMap,
    ),

    malpractice: enrichCredentialCollection(
      'malpractice',
      credentials.malpractice,
      eventMap,
    ),
  }
}
