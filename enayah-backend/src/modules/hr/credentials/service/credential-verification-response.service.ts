//response enrichment service
// enayah-backend/src/modules/hr/credentials/service/credential-verification-response.service.ts

import type { CredentialVerificationCredentialType } from '../../../../db'

import type {
  CredentialVerificationEventSummary,
  CredentialVerificationMetadata,
  CredentialVerificationActorSummary,
} from '../dto/credential-verification.types'

import type { LatestCredentialVerificationEventRecord } from '../repository/credential-verification-event.repository'

type CredentialVerificationSnapshot = {
  id: string
  isVerified?: boolean | null
  verifiedAt?: Date | null
  verifiedBy?: string | null
  verificationRemarks?: string | null
}

type CredentialActorMap = Map<string, CredentialVerificationActorSummary>

type CredentialEventMap = Map<string, LatestCredentialVerificationEventRecord>

type EmployeeCredentialCollections = {
  degrees: CredentialVerificationSnapshot[]
  boards: CredentialVerificationSnapshot[]
  fellowships: CredentialVerificationSnapshot[]
  memberships: CredentialVerificationSnapshot[]
  licenses: CredentialVerificationSnapshot[]
  lifeSupport: CredentialVerificationSnapshot[]
  malpractice: CredentialVerificationSnapshot[]
}

function createCredentialEventKey(
  credentialType: CredentialVerificationCredentialType,
  credentialId: string,
): string {
  return `${credentialType}:${credentialId}`
}

function datesMatch(
  first: Date | null | undefined,
  second: Date | null | undefined,
): boolean {
  if (!first || !second) {
    return false
  }

  return first.getTime() === second.getTime()
}

/*
 * Repository events must be ordered newest-first.
 * Keep only the newest event for each credential.
 */
function createLatestCredentialEventMap(
  events: LatestCredentialVerificationEventRecord[],
): CredentialEventMap {
  const eventMap: CredentialEventMap = new Map()

  for (const event of events) {
    const key = createCredentialEventKey(
      event.credentialType,
      event.credentialId,
    )

    if (!eventMap.has(key)) {
      eventMap.set(key, event)
    }
  }

  return eventMap
}

function createCredentialActorMap(
  actors: CredentialVerificationActorSummary[],
): CredentialActorMap {
  return new Map(actors.map((actor) => [actor.id, actor]))
}

/*
 * Collect only users referenced by the current verified snapshot.
 *
 * This also supports verified records created before the
 * verification-event history table was introduced.
 */
export function collectCurrentCredentialVerifierIds(
  credentials: EmployeeCredentialCollections,
): string[] {
  const verifierIds = new Set<string>()

  const collections = [
    credentials.degrees,
    credentials.boards,
    credentials.fellowships,
    credentials.memberships,
    credentials.licenses,
    credentials.lifeSupport,
    credentials.malpractice,
  ]

  for (const collection of collections) {
    for (const credential of collection) {
      if (credential.isVerified && credential.verifiedBy) {
        verifierIds.add(credential.verifiedBy)
      }
    }
  }

  return [...verifierIds]
}

function toEventSummary(
  event: LatestCredentialVerificationEventRecord,
): CredentialVerificationEventSummary {
  return {
    id: event.id,
    credentialType: event.credentialType,
    credentialId: event.credentialId,
    action: event.action,
    remarks: event.remarks,
    performedAt: event.performedAt,
    performedBy: event.performedBy,
    evidenceDocument: event.evidenceDocument,
  }
}

function enrichCredentialCollection<
  TCredential extends CredentialVerificationSnapshot,
>(
  credentialType: CredentialVerificationCredentialType,
  credentials: TCredential[],
  actorMap: CredentialActorMap,
  eventMap: CredentialEventMap,
): Array<
  TCredential & {
    verification: CredentialVerificationMetadata
  }
> {
  return credentials.map((credential) => {
    const isVerified = credential.isVerified ?? false

    const latestEvent =
      eventMap.get(createCredentialEventKey(credentialType, credential.id)) ??
      null

    /*
     * Resolve the current verifier from the credential snapshot,
     * rather than relying only on the latest event.
     */
    const currentVerifier =
      isVerified && credential.verifiedBy
        ? (actorMap.get(credential.verifiedBy) ?? null)
        : null

    /*
     * Evidence is considered part of the current verification
     * only when the latest event matches the current snapshot.
     *
     * This prevents historical evidence from being presented as
     * current after revocation, document replacement, or another
     * verification-state reset.
     */
    const latestEventMatchesCurrentVerification = Boolean(
      isVerified &&
      credential.verifiedAt &&
      credential.verifiedBy &&
      latestEvent &&
      latestEvent.action === 'verified' &&
      latestEvent.performedBy.id === credential.verifiedBy &&
      datesMatch(latestEvent.performedAt, credential.verifiedAt),
    )

    return {
      ...credential,

      verification: {
        isVerified,

        verifiedAt: isVerified ? (credential.verifiedAt ?? null) : null,

        remarks: credential.verificationRemarks ?? null,

        verifiedBy: currentVerifier,

        evidenceDocument: latestEventMatchesCurrentVerification
          ? (latestEvent?.evidenceDocument ?? null)
          : null,

        latestEvent: latestEvent ? toEventSummary(latestEvent) : null,
      },
    }
  })
}

export function enrichEmployeeCredentialsWithVerification<
  TCredentials extends EmployeeCredentialCollections,
>(
  credentials: TCredentials,
  actors: CredentialVerificationActorSummary[],
  events: LatestCredentialVerificationEventRecord[],
) {
  const actorMap = createCredentialActorMap(actors)

  const eventMap = createLatestCredentialEventMap(events)

  return {
    ...credentials,

    degrees: enrichCredentialCollection(
      'degree',
      credentials.degrees,
      actorMap,
      eventMap,
    ),

    boards: enrichCredentialCollection(
      'board',
      credentials.boards,
      actorMap,
      eventMap,
    ),

    fellowships: enrichCredentialCollection(
      'fellowship',
      credentials.fellowships,
      actorMap,
      eventMap,
    ),

    memberships: enrichCredentialCollection(
      'membership',
      credentials.memberships,
      actorMap,
      eventMap,
    ),

    licenses: enrichCredentialCollection(
      'license',
      credentials.licenses,
      actorMap,
      eventMap,
    ),

    lifeSupport: enrichCredentialCollection(
      'life_support',
      credentials.lifeSupport,
      actorMap,
      eventMap,
    ),

    malpractice: enrichCredentialCollection(
      'malpractice',
      credentials.malpractice,
      actorMap,
      eventMap,
    ),
  }
}
