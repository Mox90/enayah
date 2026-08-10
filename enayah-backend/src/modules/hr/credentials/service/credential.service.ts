// enayah-backend/src/modules/hr/credentials/service/credential.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { DB, db } from '../../../../db'

import {
  CreateBoardDto,
  CreateFellowshipDto,
  CreateLicenseDto,
  CreateLifeSupportDto,
  CreateMalpracticeDto,
  CreateMembershipDto,
  UpdateBoardDto,
  UpdateCredentialVerificationDto,
  UpdateFellowshipDto,
  UpdateLicenseDto,
  UpdateLifeSupportDto,
  UpdateMalpracticeDto,
  UpdateMembershipDto,
  type CreateDegreeDto,
  type CreateEmployeeCredentialsDto,
  type UpdateDegreeDto,
} from '../dto/credential.request'
import {
  boardDocumentRepository,
  degreeDocumentRepository,
  fellowshipDocumentRepository,
  licenseDocumentRepository,
  lifeSupportDocumentRepository,
  malpracticeDocumentRepository,
  membershipDocumentRepository,
} from '../repository/credential-document-repositories'
import { CredentialVerificationEventRepository } from '../repository/credential-verification-event.repository'
import {
  boardVerificationRepository,
  degreeVerificationRepository,
  fellowshipVerificationRepository,
  licenseVerificationRepository,
  lifeSupportVerificationRepository,
  malpracticeVerificationRepository,
  membershipVerificationRepository,
} from '../repository/credential-verification-repositories'
import { CredentialVerifierRepository } from '../repository/credential-verifier.repository'

import {
  CredentialRepository,
  type CredentialFileCategory,
} from '../repository/credential.repository'

import {
  processCredentialDocument,
  type ProcessedCredentialDocument,
} from './credential-document-processing.service'

import {
  removeCredentialDocumentByAbsolutePath,
  resolveCredentialDocument,
  removeCredentialDocument,
  storeCredentialDocument,
  type StoredCredentialDocument,
} from './credential-document-storage.service'
import { getCredentialVerificationEvidence as getCredentialVerificationEvidenceForAccess } from './credential-verification-evidence-access.service'
import {
  collectCurrentCredentialVerifierIds,
  enrichEmployeeCredentialsWithVerification,
} from './credential-verification-response.service'
import { updateCredentialVerification as performCredentialVerificationUpdate } from './credential-verification.service'

type PreparedCredentialDocument = {
  processed: ProcessedCredentialDocument
  stored: StoredCredentialDocument
}

const DEGREE_FILE_CATEGORY: CredentialFileCategory = 'employee_degree'
const BOARD_FILE_CATEGORY: CredentialFileCategory = 'employee_board'
const FELLOWSHIP_FILE_CATEGORY: CredentialFileCategory = 'employee_fellowship'
const MEMBERSHIP_FILE_CATEGORY: CredentialFileCategory = 'employee_membership'
const LICENSE_FILE_CATEGORY: CredentialFileCategory = 'employee_license'
const LIFE_SUPPORT_FILE_CATEGORY: CredentialFileCategory =
  'employee_life_support'
const MALPRACTICE_FILE_CATEGORY: CredentialFileCategory = 'employee_malpractice'

export type CredentialKind =
  | 'degree'
  | 'board'
  | 'fellowship'
  | 'membership'
  | 'license'
  | 'life-support'
  | 'malpractice'

const CREDENTIAL_FILE_CATEGORY_BY_KIND = {
  degree: DEGREE_FILE_CATEGORY,
  board: BOARD_FILE_CATEGORY,
  fellowship: FELLOWSHIP_FILE_CATEGORY,
  membership: MEMBERSHIP_FILE_CATEGORY,
  license: LICENSE_FILE_CATEGORY,
  'life-support': LIFE_SUPPORT_FILE_CATEGORY,
  malpractice: MALPRACTICE_FILE_CATEGORY,
} as const satisfies Record<CredentialKind, CredentialFileCategory>

type CreateCredentialWithDocumentOptions<TResult> = {
  employeeId: string
  uploadedByUserId: string
  kind: CredentialKind
  document?: Express.Multer.File

  createRecord: (tx: DB, documentFileId: string | null) => Promise<TResult>
}

async function createCredentialWithDocument<TResult>({
  employeeId,
  uploadedByUserId,
  kind,
  document,
  createRecord,
}: CreateCredentialWithDocumentOptions<TResult>): Promise<TResult> {
  let preparedDocument: PreparedCredentialDocument | null = null

  try {
    if (document) {
      preparedDocument = await prepareDocument(document, kind)
    }

    const category = CREDENTIAL_FILE_CATEGORY_BY_KIND[kind]

    return await db.transaction(async (tx: DB) => {
      let documentFileId: string | null = null

      if (preparedDocument) {
        const fileRecord = await CredentialRepository.createCredentialFile(tx, {
          storedName: preparedDocument.stored.storedName,
          originalName: preparedDocument.stored.originalName,
          mimeType: preparedDocument.processed.mimeType,
          fileSize: preparedDocument.processed.fileSize,
          storageKey: preparedDocument.stored.storageKey,
          checksumSha256: preparedDocument.processed.checksumSha256,
          category,
          uploadedByUserId,
        })

        documentFileId = fileRecord.id
      }

      return createRecord(tx, documentFileId)
    })
  } catch (error: unknown) {
    await cleanUpNewDocument(preparedDocument)

    throw error
  }
}

type CreateCredentialCommand = {
  employeeId: string
  uploadedByUserId: string
  document?: Express.Multer.File
} & (
  | {
      kind: 'degree'
      data: CreateDegreeDto
    }
  | {
      kind: 'board'
      data: CreateBoardDto
    }
  | {
      kind: 'fellowship'
      data: CreateFellowshipDto
    }
  | {
      kind: 'membership'
      data: CreateMembershipDto
    }
  | {
      kind: 'license'
      data: CreateLicenseDto
    }
  | {
      kind: 'life-support'
      data: CreateLifeSupportDto
    }
  | {
      kind: 'malpractice'
      data: CreateMalpracticeDto
    }
)

type ExistingCredentialDocument = {
  documentFileId: string | null
  documentCategory: CredentialFileCategory | null
}

type UpdateCredentialWithDocumentOptions<TResult> = {
  employeeId: string
  credentialId: string
  updatedByUserId: string
  kind: CredentialKind
  credentialLabel: string
  document?: Express.Multer.File

  findExisting: (
    tx: DB,
    employeeId: string,
    credentialId: string,
  ) => Promise<ExistingCredentialDocument | null>

  updateRecord: (
    tx: DB,
    newDocumentFileId: string | undefined,
  ) => Promise<TResult>
}

async function updateCredentialWithDocument<TResult>({
  employeeId,
  credentialId,
  updatedByUserId,
  kind,
  credentialLabel,
  document,
  findExisting,
  updateRecord,
}: UpdateCredentialWithDocumentOptions<TResult>): Promise<TResult> {
  let preparedDocument: PreparedCredentialDocument | null = null

  try {
    if (document) {
      preparedDocument = await prepareDocument(document, kind)
    }

    const category = CREDENTIAL_FILE_CATEGORY_BY_KIND[kind]

    return await db.transaction(async (tx) => {
      const existing = await findExisting(tx, employeeId, credentialId)

      if (!existing) {
        throw new AppError(`${credentialLabel} not found.`, 404)
      }

      let newDocumentFileId: string | undefined

      if (preparedDocument) {
        const newFile = await CredentialRepository.createCredentialFile(tx, {
          storedName: preparedDocument.stored.storedName,
          originalName: preparedDocument.stored.originalName,
          mimeType: preparedDocument.processed.mimeType,
          fileSize: preparedDocument.processed.fileSize,
          storageKey: preparedDocument.stored.storageKey,
          checksumSha256: preparedDocument.processed.checksumSha256,
          category,
          uploadedByUserId: updatedByUserId,
        })

        newDocumentFileId = newFile.id
      }

      const updatedRecord = await updateRecord(tx, newDocumentFileId)

      if (
        newDocumentFileId &&
        existing.documentFileId &&
        existing.documentCategory === category
      ) {
        await CredentialRepository.softDeleteCredentialFile(
          tx,
          existing.documentFileId,
          category,
          updatedByUserId,
        )
      }

      /*
       * The previous physical bytes remain retained.
       * Only the file metadata is soft-deleted.
       */
      return updatedRecord
    })
  } catch (error: unknown) {
    await cleanUpNewDocument(preparedDocument)

    throw error
  }
}

async function softDeleteCredentialWithDocument({
  employeeId,
  credentialId,
  deletedByUserId,
  kind,
  credentialLabel,
  findExisting,
  deleteRecord,
}: SoftDeleteCredentialWithDocumentOptions): Promise<void> {
  const category = CREDENTIAL_FILE_CATEGORY_BY_KIND[kind]

  await db.transaction(async (tx: DB) => {
    const existing = await findExisting(tx, employeeId, credentialId)

    if (!existing) {
      throw new AppError(`${credentialLabel} not found.`, 404)
    }

    await deleteRecord(tx)

    if (existing.documentFileId && existing.documentCategory === category) {
      await CredentialRepository.softDeleteCredentialFile(
        tx,
        existing.documentFileId,
        category,
        deletedByUserId,
      )
    }

    /*
     * Retain the physical document bytes.
     * Only credential/file metadata is soft-deleted.
     */
  })
}

type UpdateCredentialCommand = {
  employeeId: string
  credentialId: string
  updatedByUserId: string
  document?: Express.Multer.File
} & (
  | {
      kind: 'degree'
      data: UpdateDegreeDto
    }
  | {
      kind: 'board'
      data: UpdateBoardDto
    }
  | {
      kind: 'fellowship'
      data: UpdateFellowshipDto
    }
  | {
      kind: 'membership'
      data: UpdateMembershipDto
    }
  | {
      kind: 'license'
      data: UpdateLicenseDto
    }
  | {
      kind: 'life-support'
      data: UpdateLifeSupportDto
    }
  | {
      kind: 'malpractice'
      data: UpdateMalpracticeDto
    }
)

async function prepareDocument(
  file: Express.Multer.File,
  kind: CredentialKind,
): Promise<PreparedCredentialDocument> {
  const processed = await processCredentialDocument(file)

  const stored = await storeCredentialDocument({
    document: processed,
    originalName: file.originalname,
    credentialKind: kind,
  })

  return {
    processed,
    stored,
  }
}

async function cleanUpNewDocument(
  preparedDocument: PreparedCredentialDocument | null,
): Promise<void> {
  if (!preparedDocument) {
    return
  }

  await removeCredentialDocumentByAbsolutePath(
    preparedDocument.stored.absolutePath,
  ).catch((cleanupError: unknown) => {
    console.error(
      'Unable to clean up the new credential document:',
      cleanupError,
    )
  })
}

async function removeReplacedDocument(
  storageKey: string | null,
): Promise<void> {
  if (!storageKey) {
    return
  }

  await removeCredentialDocument(storageKey).catch((cleanupError: unknown) => {
    console.error(
      'Unable to remove the replaced credential document:',
      cleanupError,
    )
  })
}

export type CredentialDocumentAccessResult = {
  id: string
  credentialId: string
  employeeId: string
  originalName: string
  mimeType: string
  fileSize: number

  /*
   * Internal server value used by the controller.
   * It must never be included in a JSON response.
   */
  absolutePath: string
}

// type CredentialDocumentRepositoryPort = Pick<
//   typeof degreeDocumentRepository,
//   'findActiveDocument'
// >
type CredentialDocumentRepositoryPort = {
  findActiveDocument: (
    tx: DB,
    employeeId: string,
    credentialId: string,
  ) => ReturnType<typeof degreeDocumentRepository.findActiveDocument>
}

type GetCredentialDocumentInput = {
  kind: CredentialKind
  employeeId: string
  credentialId: string
}

const credentialDocumentRepositories = {
  degree: degreeDocumentRepository,
  board: boardDocumentRepository,
  fellowship: fellowshipDocumentRepository,
  membership: membershipDocumentRepository,
  license: licenseDocumentRepository,
  'life-support': lifeSupportDocumentRepository,
  malpractice: malpracticeDocumentRepository,
} as const satisfies Record<
  CredentialKind,
  CredentialDocumentRepositoryPort &
    CredentialVerificationDocumentRepositoryPort
>

const credentialDocumentNotFoundMessages = {
  degree: 'Degree document not found.',
  board: 'Board document not found.',
  fellowship: 'Fellowship document not found.',
  membership: 'Membership document not found.',
  license: 'License document not found.',
  'life-support': 'Life support document not found.',
  malpractice: 'Malpractice document not found.',
} as const satisfies Record<CredentialKind, string>

type CredentialVerificationType =
  | 'degree'
  | 'board'
  | 'fellowship'
  | 'membership'
  | 'license'
  | 'life_support'
  | 'malpractice'

const credentialVerificationTypeByKind = {
  degree: 'degree',
  board: 'board',
  fellowship: 'fellowship',
  membership: 'membership',
  license: 'license',
  'life-support': 'life_support',
  malpractice: 'malpractice',
} as const satisfies Record<CredentialKind, CredentialVerificationType>

type CredentialVerificationOperationInput = Parameters<
  typeof performCredentialVerificationUpdate
>[0]

type CredentialVerificationRepositoryPort =
  CredentialVerificationOperationInput['verificationRepository']

type CredentialVerificationDocumentRepositoryPort =
  CredentialVerificationOperationInput['documentRepository']

const credentialVerificationRepositories = {
  degree: degreeVerificationRepository,
  board: boardVerificationRepository,
  fellowship: fellowshipVerificationRepository,
  membership: membershipVerificationRepository,
  license: licenseVerificationRepository,
  'life-support': lifeSupportVerificationRepository,
  malpractice: malpracticeVerificationRepository,
} as const satisfies Record<
  CredentialKind,
  CredentialVerificationRepositoryPort
>

const credentialVerificationLabels = {
  degree: 'Degree',
  board: 'Board',
  fellowship: 'Fellowship',
  membership: 'Membership',
  license: 'License',
  'life-support': 'Life-support certification',
  malpractice: 'Malpractice insurance',
} as const satisfies Record<CredentialKind, string>

type GetCredentialVerificationEvidenceInput = {
  kind: CredentialKind
  employeeId: string
  credentialId: string
  eventId: string
}

type UpdateCredentialVerificationCommand = {
  kind: CredentialKind
  employeeId: string
  credentialId: string
  verifiedByUserId: string
  data: UpdateCredentialVerificationDto
  evidence?: Express.Multer.File
}

type SoftDeleteCredentialCommand = {
  kind: CredentialKind
  employeeId: string
  credentialId: string
  deletedByUserId: string
}

type SoftDeleteCredentialWithDocumentOptions = {
  employeeId: string
  credentialId: string
  deletedByUserId: string
  kind: CredentialKind
  credentialLabel: string

  findExisting: (
    tx: DB,
    employeeId: string,
    credentialId: string,
  ) => Promise<ExistingCredentialDocument | null>

  deleteRecord: (tx: DB) => Promise<unknown>
}

async function getCredentialDocumentForAccess({
  repository,
  employeeId,
  credentialId,
  notFoundMessage,
}: {
  repository: CredentialDocumentRepositoryPort
  employeeId: string
  credentialId: string
  notFoundMessage: string
}): Promise<CredentialDocumentAccessResult> {
  const document = await repository.findActiveDocument(
    db,
    employeeId,
    credentialId,
  )

  if (!document) {
    throw new AppError(notFoundMessage, 404)
  }

  const resolvedDocument = await resolveCredentialDocument(document.storageKey)

  /*
   * Detect a file that was changed outside the
   * application after its metadata was recorded.
   */
  if (resolvedDocument.fileSize !== document.fileSize) {
    throw new AppError(
      'Credential document failed its storage integrity check.',
      500,
    )
  }

  return {
    id: document.id,
    credentialId: document.credentialId,
    employeeId: document.employeeId,
    originalName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    absolutePath: resolvedDocument.absolutePath,
  }
}

function getVerificationUpdateCommon(
  args: UpdateCredentialVerificationCommand,
) {
  return {
    employeeId: args.employeeId,
    credentialId: args.credentialId,
    actorUserId: args.verifiedByUserId,
    data: args.data,

    ...(args.evidence
      ? {
          evidence: args.evidence,
        }
      : {}),
  }
}

export const CredentialService = {
  findByEmployeeId: async (employeeId: string) => {
    const [credentials, verificationEvents] = await Promise.all([
      CredentialRepository.findByEmployeeId(db, employeeId),

      CredentialVerificationEventRepository.findForEmployee(db, employeeId),
    ])

    const verifierIds = collectCurrentCredentialVerifierIds(credentials)

    const verificationActors = await CredentialVerifierRepository.findByUserIds(
      db,
      verifierIds,
    )

    return enrichEmployeeCredentialsWithVerification(
      credentials,
      verificationActors,
      verificationEvents,
    )
  },

  getCredentialDocument: async ({
    kind,
    employeeId,
    credentialId,
  }: GetCredentialDocumentInput) => {
    return getCredentialDocumentForAccess({
      repository: credentialDocumentRepositories[kind],
      employeeId,
      credentialId,
      notFoundMessage: credentialDocumentNotFoundMessages[kind],
    })
  },

  updateCredentialVerification: async (
    args: UpdateCredentialVerificationCommand,
  ) => {
    const common = getVerificationUpdateCommon(args)

    switch (args.kind) {
      case 'degree':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: degreeDocumentRepository,
          verificationRepository: degreeVerificationRepository,
          credentialType: 'degree',
          credentialLabel: 'Degree',
        })

      case 'board':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: boardDocumentRepository,
          verificationRepository: boardVerificationRepository,
          credentialType: 'board',
          credentialLabel: 'Board',
        })

      case 'fellowship':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: fellowshipDocumentRepository,
          verificationRepository: fellowshipVerificationRepository,
          credentialType: 'fellowship',
          credentialLabel: 'Fellowship',
        })

      case 'membership':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: membershipDocumentRepository,
          verificationRepository: membershipVerificationRepository,
          credentialType: 'membership',
          credentialLabel: 'Membership',
        })

      case 'license':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: licenseDocumentRepository,
          verificationRepository: licenseVerificationRepository,
          credentialType: 'license',
          credentialLabel: 'License',
        })

      case 'life-support':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: lifeSupportDocumentRepository,
          verificationRepository: lifeSupportVerificationRepository,
          credentialType: 'life_support',
          credentialLabel: 'Life-support certification',
        })

      case 'malpractice':
        return performCredentialVerificationUpdate({
          ...common,
          documentRepository: malpracticeDocumentRepository,
          verificationRepository: malpracticeVerificationRepository,
          credentialType: 'malpractice',
          credentialLabel: 'Malpractice insurance',
        })
    }
  },

  getCredentialVerificationEvidence: async ({
    kind,
    employeeId,
    credentialId,
    eventId,
  }: GetCredentialVerificationEvidenceInput) => {
    return getCredentialVerificationEvidenceForAccess({
      employeeId,
      credentialType: credentialVerificationTypeByKind[kind],
      credentialId,
      eventId,
    })
  },

  createAll: async (employeeId: string, data: CreateEmployeeCredentialsDto) => {
    return db.transaction((tx) =>
      CredentialRepository.createAll(tx, employeeId, data),
    )
  },

  createCredential: async (args: CreateCredentialCommand) => {
    const common = {
      employeeId: args.employeeId,
      uploadedByUserId: args.uploadedByUserId,
      kind: args.kind,
      ...(args.document ? { document: args.document } : {}),
    }

    return createCredentialWithDocument({
      ...common,
      createRecord: async (tx, documentFileId) => {
        const commonValues = {
          documentFileId,
          createdBy: args.uploadedByUserId,
          updatedBy: args.uploadedByUserId,
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null,
          verificationRemarks: null,
        }

        switch (args.kind) {
          case 'degree':
            return CredentialRepository.createDegree(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'board':
            return CredentialRepository.createBoard(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'fellowship':
            return CredentialRepository.createFellowship(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'membership':
            return CredentialRepository.createMembership(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'license':
            return CredentialRepository.createLicense(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'life-support':
            return CredentialRepository.createLifeSupport(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })

          case 'malpractice':
            return CredentialRepository.createMalpractice(tx, args.employeeId, {
              ...args.data,
              ...commonValues,
            })
        }
      },
    })
  },

  updateCredential: async (args: UpdateCredentialCommand) => {
    const verificationReset = {
      isVerified: false,
      verifiedAt: null,
      verifiedBy: null,
      verificationRemarks: null,
    }

    const commonOptions = {
      employeeId: args.employeeId,
      credentialId: args.credentialId,
      updatedByUserId: args.updatedByUserId,
      kind: args.kind,
      ...(args.document ? { document: args.document } : {}),
    }

    switch (args.kind) {
      case 'degree':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Degree',
          findExisting: (tx, employeeId, credentialId) =>
            degreeDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateDegree(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'board':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Board certification',
          findExisting: (tx, employeeId, credentialId) =>
            boardDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateBoard(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'fellowship':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Fellowship',
          findExisting: (tx, employeeId, credentialId) =>
            fellowshipDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateFellowship(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'membership':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Membership',
          findExisting: (tx, employeeId, credentialId) =>
            membershipDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateMembership(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'license':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'License',
          findExisting: (tx, employeeId, credentialId) =>
            licenseDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateLicense(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'life-support':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Life-support certification',
          findExisting: (tx, employeeId, credentialId) =>
            lifeSupportDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateLifeSupport(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })

      case 'malpractice':
        return updateCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Malpractice insurance',
          findExisting: (tx, employeeId, credentialId) =>
            malpracticeDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          updateRecord: (tx, newDocumentFileId) =>
            CredentialRepository.updateMalpractice(tx, args.credentialId, {
              ...args.data,
              updatedBy: args.updatedByUserId,
              ...(newDocumentFileId
                ? { documentFileId: newDocumentFileId, ...verificationReset }
                : {}),
            }),
        })
    }
  },

  softDeleteCredential: async (
    args: SoftDeleteCredentialCommand,
  ): Promise<void> => {
    const commonOptions = {
      employeeId: args.employeeId,
      credentialId: args.credentialId,
      deletedByUserId: args.deletedByUserId,
      kind: args.kind,
    }

    switch (args.kind) {
      case 'degree':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Degree',

          findExisting: (tx, employeeId, credentialId) =>
            degreeDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteDegree(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'board':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Board certification',

          findExisting: (tx, employeeId, credentialId) =>
            boardDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteBoard(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'fellowship':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Fellowship',

          findExisting: (tx, employeeId, credentialId) =>
            fellowshipDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteFellowship(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'membership':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Membership',

          findExisting: (tx, employeeId, credentialId) =>
            membershipDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteMembership(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'license':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'License',

          findExisting: (tx, employeeId, credentialId) =>
            licenseDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteLicense(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'life-support':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Life-support certification',

          findExisting: (tx, employeeId, credentialId) =>
            lifeSupportDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteLifeSupport(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })

      case 'malpractice':
        return softDeleteCredentialWithDocument({
          ...commonOptions,
          credentialLabel: 'Malpractice insurance',

          findExisting: (tx, employeeId, credentialId) =>
            malpracticeDocumentRepository.findForDocumentUpdate(
              tx,
              employeeId,
              credentialId,
            ),

          deleteRecord: (tx) =>
            CredentialRepository.softDeleteMalpractice(
              tx,
              args.credentialId,
              args.deletedByUserId,
            ),
        })
    }
  },

  // createDegree: async ({
  //   employeeId,
  //   data,
  //   uploadedByUserId,
  //   document,
  // }: {
  //   employeeId: string
  //   data: CreateDegreeDto
  //   uploadedByUserId: string
  //   document?: Express.Multer.File
  // }) => {
  //   let preparedDocument: PreparedCredentialDocument | null = null

  //   try {
  //     if (document) {
  //       preparedDocument = await prepareDegreeDocument(document)
  //     }

  //     return await db.transaction(async (tx) => {
  //       let documentFileId: string | null = null

  //       if (preparedDocument) {
  //         const fileRecord = await CredentialRepository.createCredentialFile(
  //           tx,
  //           {
  //             storedName: preparedDocument.stored.storedName,
  //             originalName: preparedDocument.stored.originalName,
  //             mimeType: preparedDocument.processed.mimeType,
  //             fileSize: preparedDocument.processed.fileSize,
  //             storageKey: preparedDocument.stored.storageKey,
  //             checksumSha256: preparedDocument.processed.checksumSha256,
  //             category: DEGREE_FILE_CATEGORY,
  //             uploadedByUserId,
  //           },
  //         )

  //         documentFileId = fileRecord.id
  //       }

  //       return CredentialRepository.createDegree(tx, employeeId, {
  //         ...data,
  //         documentFileId,
  //         createdBy: uploadedByUserId,
  //         updatedBy: uploadedByUserId,
  //         isVerified: false,
  //         verifiedAt: null,
  //         verifiedBy: null,
  //         verificationRemarks: null,
  //       })
  //     })
  //   } catch (error: unknown) {
  //     await cleanUpNewDocument(preparedDocument)
  //     throw error
  //   }
  // },

  // createBoard: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createBoard(tx, employeeId, data),
  //   ),

  // createFellowship: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createFellowship(tx, employeeId, data),
  //   ),

  // createMembership: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createMembership(tx, employeeId, data),
  //   ),

  // createLicense: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createLicense(tx, employeeId, data),
  //   ),

  // createLifeSupport: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createLifeSupport(tx, employeeId, data),
  //   ),

  // createMalpractice: async (employeeId: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.createMalpractice(tx, employeeId, data),
  //   ),

  // updateDegree: async ({
  //   employeeId,
  //   degreeId,
  //   data,
  //   updatedByUserId,
  //   document,
  // }: {
  //   employeeId: string
  //   degreeId: string
  //   data: UpdateDegreeDto
  //   updatedByUserId: string
  //   document?: Express.Multer.File
  // }) => {
  //   let preparedDocument: PreparedCredentialDocument | null = null

  //   try {
  //     if (document) {
  //       preparedDocument = await prepareDegreeDocument(document)
  //     }

  //     return await db.transaction(async (tx) => {
  //       const existingDegree =
  //         // await CredentialRepository.findDegreeForDocumentUpdate(
  //         //   tx,
  //         //   employeeId,
  //         //   degreeId,
  //         // )
  //         await degreeDocumentRepository.findForDocumentUpdate(
  //           tx,
  //           employeeId,
  //           degreeId,
  //         )

  //       if (!existingDegree) {
  //         throw new AppError('Degree not found.', 404)
  //       }

  //       let newDocumentFileId: string | undefined

  //       if (preparedDocument) {
  //         const newFile = await CredentialRepository.createCredentialFile(tx, {
  //           storedName: preparedDocument.stored.storedName,
  //           originalName: preparedDocument.stored.originalName,
  //           mimeType: preparedDocument.processed.mimeType,
  //           fileSize: preparedDocument.processed.fileSize,
  //           storageKey: preparedDocument.stored.storageKey,
  //           checksumSha256: preparedDocument.processed.checksumSha256,
  //           category: DEGREE_FILE_CATEGORY,
  //           uploadedByUserId: updatedByUserId,
  //         })

  //         newDocumentFileId = newFile.id
  //       }

  //       const updatedDegree = await CredentialRepository.updateDegree(
  //         tx,
  //         degreeId,
  //         {
  //           ...data,
  //           updatedBy: updatedByUserId,
  //           ...(newDocumentFileId && {
  //             documentFileId: newDocumentFileId,
  //             /*
  //              * Replacing evidence invalidates
  //              * previous verification.
  //              */
  //             isVerified: false,
  //             verifiedAt: null,
  //             verifiedBy: null,
  //             verificationRemarks: null,
  //           }),
  //         },
  //       )

  //       if (
  //         newDocumentFileId &&
  //         existingDegree.documentFileId &&
  //         existingDegree.documentCategory === DEGREE_FILE_CATEGORY
  //       ) {
  //         await CredentialRepository.softDeleteCredentialFile(
  //           tx,
  //           existingDegree.documentFileId,
  //           DEGREE_FILE_CATEGORY,
  //           updatedByUserId,
  //         )
  //       }

  //       // return {
  //       //   updatedDegree,
  //       //   previousStorageKey:
  //       //     newDocumentFileId &&
  //       //     existingDegree.documentCategory === DEGREE_FILE_CATEGORY
  //       //       ? existingDegree.documentStorageKey
  //       //       : null,
  //       // }
  //       return updatedDegree
  //     })

  //     //await removeReplacedDocument(result.previousStorageKey)
  //   } catch (error: unknown) {
  //     await cleanUpNewDocument(preparedDocument)

  //     throw error
  //   }
  // },

  // updateBoard: async (id: string, data: unknown) =>
  //   db.transaction((tx) => CredentialRepository.updateBoard(tx, id, data)),

  // updateFellowship: async (id: string, data: unknown) =>
  //   db.transaction((tx) => CredentialRepository.updateFellowship(tx, id, data)),

  // updateMembership: async (id: string, data: unknown) =>
  //   db.transaction((tx) => CredentialRepository.updateMembership(tx, id, data)),

  // updateLicense: async (id: string, data: unknown) =>
  //   db.transaction((tx) => CredentialRepository.updateLicense(tx, id, data)),

  // updateLifeSupport: async (id: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.updateLifeSupport(tx, id, data),
  //   ),

  // updateMalpractice: async (id: string, data: unknown) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.updateMalpractice(tx, id, data),
  //   ),

  // updateDegreeVerification: async ({
  //   employeeId,
  //   degreeId,
  //   verifiedByUserId,
  //   data,
  //   evidence,
  // }: {
  //   employeeId: string
  //   degreeId: string
  //   verifiedByUserId: string
  //   data: UpdateCredentialVerificationDto
  //   evidence?: Express.Multer.File
  // }) => {
  //   return performCredentialVerificationUpdate({
  //     documentRepository: degreeDocumentRepository,
  //     verificationRepository: degreeVerificationRepository,
  //     credentialType: 'degree',
  //     credentialLabel: 'Degree',
  //     employeeId,
  //     credentialId: degreeId,
  //     actorUserId: verifiedByUserId,
  //     data,
  //     ...(evidence ? { evidence } : {}),
  //   })
  // },

  // updateBoardVerification: async ({
  //   employeeId,
  //   boardId,
  //   verifiedByUserId,
  //   data,
  //   evidence,
  // }: {
  //   employeeId: string
  //   boardId: string
  //   verifiedByUserId: string
  //   data: UpdateCredentialVerificationDto
  //   evidence?: Express.Multer.File
  // }) => {
  //   return performCredentialVerificationUpdate({
  //     documentRepository: boardDocumentRepository,
  //     verificationRepository: boardVerificationRepository,
  //     credentialType: 'board',
  //     credentialLabel: 'Board',
  //     employeeId,
  //     credentialId: boardId,
  //     actorUserId: verifiedByUserId,
  //     data,
  //     ...(evidence ? { evidence } : {}),
  //   })
  // },

  // softDeleteDegree: async ({
  //   employeeId,
  //   degreeId,
  //   deletedByUserId,
  // }: {
  //   employeeId: string
  //   degreeId: string
  //   deletedByUserId: string
  // }) => {
  //   return await db.transaction(async (tx) => {
  //     const existingDegree =
  //       await degreeDocumentRepository.findForDocumentUpdate(
  //         tx,
  //         employeeId,
  //         degreeId,
  //       )

  //     if (!existingDegree) {
  //       throw new AppError('Degree not found.', 404)
  //     }

  //     await CredentialRepository.softDeleteDegree(tx, degreeId, deletedByUserId)

  //     if (
  //       existingDegree.documentFileId &&
  //       existingDegree.documentCategory === DEGREE_FILE_CATEGORY
  //     ) {
  //       await CredentialRepository.softDeleteCredentialFile(
  //         tx,
  //         existingDegree.documentFileId,
  //         DEGREE_FILE_CATEGORY,
  //         deletedByUserId,
  //       )
  //     }

  //     // return {
  //     //   storageKey:
  //     //     existingDegree.documentCategory === DEGREE_FILE_CATEGORY
  //     //       ? existingDegree.documentStorageKey
  //     //       : null,
  //     // }
  //   })

  //   //await removeReplacedDocument(result.storageKey)
  // },

  // softDeleteBoard: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteBoard(tx, id, userId),
  //   ),

  // softDeleteFellowship: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteFellowship(tx, id, userId),
  //   ),

  // softDeleteMembership: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteMembership(tx, id, userId),
  //   ),

  // softDeleteLicense: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteLicense(tx, id, userId),
  //   ),

  // softDeleteLifeSupport: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteLifeSupport(tx, id, userId),
  //   ),

  // softDeleteMalpractice: async (id: string, userId?: string) =>
  //   db.transaction((tx) =>
  //     CredentialRepository.softDeleteMalpractice(tx, id, userId),
  //   ),

  // getDegreeVerificationEvidence: async ({
  //   employeeId,
  //   degreeId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   degreeId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'degree',
  //     credentialId: degreeId,
  //     eventId,
  //   })
  // },

  // getBoardVerificationEvidence: async ({
  //   employeeId,
  //   boardId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   boardId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'board',
  //     credentialId: boardId,
  //     eventId,
  //   })
  // },

  // getFellowshipVerificationEvidence: async ({
  //   employeeId,
  //   fellowshipId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   fellowshipId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'fellowship',
  //     credentialId: fellowshipId,
  //     eventId,
  //   })
  // },

  // getMembershipVerificationEvidence: async ({
  //   employeeId,
  //   membershipId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   membershipId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'membership',
  //     credentialId: membershipId,
  //     eventId,
  //   })
  // },

  // getLicenseVerificationEvidence: async ({
  //   employeeId,
  //   licenseId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   licenseId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'license',
  //     credentialId: licenseId,
  //     eventId,
  //   })
  // },

  // getLifeSupportVerificationEvidence: async ({
  //   employeeId,
  //   lifeSupportId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   lifeSupportId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'life_support',
  //     credentialId: lifeSupportId,
  //     eventId,
  //   })
  // },

  // getMalpracticeVerificationEvidence: async ({
  //   employeeId,
  //   malpracticeId,
  //   eventId,
  // }: {
  //   employeeId: string
  //   malpracticeId: string
  //   eventId: string
  // }) => {
  //   return getCredentialVerificationEvidence({
  //     employeeId,
  //     credentialType: 'malpractice',
  //     credentialId: malpracticeId,
  //     eventId,
  //   })
  // },
}
