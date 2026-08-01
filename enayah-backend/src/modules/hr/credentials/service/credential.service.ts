// enayah-backend/src/modules/hr/credentials/service/credential.service.ts

import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'

import {
  type CreateDegreeDto,
  type CreateEmployeeCredentialsDto,
  type UpdateDegreeDto,
} from '../dto/credential.request'
import { degreeDocumentRepository } from '../repository/credential-document-repositories'

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

type PreparedCredentialDocument = {
  processed: ProcessedCredentialDocument
  stored: StoredCredentialDocument
}

const DEGREE_FILE_CATEGORY: CredentialFileCategory = 'employee_degree'

async function prepareDegreeDocument(
  file: Express.Multer.File,
): Promise<PreparedCredentialDocument> {
  const processed = await processCredentialDocument(file)

  const stored = await storeCredentialDocument({
    document: processed,
    originalName: file.originalname,
    credentialKind: 'degree',
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

export type GetDegreeDocumentInput = {
  employeeId: string
  degreeId: string
}

type CredentialDocumentRepositoryPort = Pick<
  typeof degreeDocumentRepository,
  'findActiveDocument'
>

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

export const CredentialService = {
  findByEmployeeId: async (employeeId: string) => {
    return CredentialRepository.findByEmployeeId(db, employeeId)
  },

  getDegreeDocument: async ({
    employeeId,
    degreeId,
  }: GetDegreeDocumentInput) => {
    const document = await getCredentialDocumentForAccess({
      repository: degreeDocumentRepository,
      employeeId,
      credentialId: degreeId,
      notFoundMessage: 'Degree document not found.',
    })

    /*
     * Expose a degree-specific property to the
     * controller while keeping the reusable helper
     * credential-neutral.
     */
    return {
      id: document.id,
      degreeId: document.credentialId,
      employeeId: document.employeeId,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      absolutePath: document.absolutePath,
    }
  },

  createAll: async (employeeId: string, data: CreateEmployeeCredentialsDto) => {
    return db.transaction((tx) =>
      CredentialRepository.createAll(tx, employeeId, data),
    )
  },

  createDegree: async ({
    employeeId,
    data,
    uploadedByUserId,
    document,
  }: {
    employeeId: string
    data: CreateDegreeDto
    uploadedByUserId: string
    document?: Express.Multer.File
  }) => {
    let preparedDocument: PreparedCredentialDocument | null = null

    try {
      if (document) {
        preparedDocument = await prepareDegreeDocument(document)
      }

      return await db.transaction(async (tx) => {
        let documentFileId: string | null = null

        if (preparedDocument) {
          const fileRecord = await CredentialRepository.createCredentialFile(
            tx,
            {
              storedName: preparedDocument.stored.storedName,
              originalName: preparedDocument.stored.originalName,
              mimeType: preparedDocument.processed.mimeType,
              fileSize: preparedDocument.processed.fileSize,
              storageKey: preparedDocument.stored.storageKey,
              checksumSha256: preparedDocument.processed.checksumSha256,
              category: DEGREE_FILE_CATEGORY,
              uploadedByUserId,
            },
          )

          documentFileId = fileRecord.id
        }

        return CredentialRepository.createDegree(tx, employeeId, {
          ...data,
          documentFileId,
          createdBy: uploadedByUserId,
          updatedBy: uploadedByUserId,
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null,
          verificationRemarks: null,
        })
      })
    } catch (error: unknown) {
      await cleanUpNewDocument(preparedDocument)
      throw error
    }
  },

  createBoard: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createBoard(tx, employeeId, data),
    ),

  createFellowship: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createFellowship(tx, employeeId, data),
    ),

  createMembership: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createMembership(tx, employeeId, data),
    ),

  createLicense: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createLicense(tx, employeeId, data),
    ),

  createLifeSupport: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createLifeSupport(tx, employeeId, data),
    ),

  createMalpractice: async (employeeId: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.createMalpractice(tx, employeeId, data),
    ),

  updateDegree: async ({
    employeeId,
    degreeId,
    data,
    updatedByUserId,
    document,
  }: {
    employeeId: string
    degreeId: string
    data: UpdateDegreeDto
    updatedByUserId: string
    document?: Express.Multer.File
  }) => {
    let preparedDocument: PreparedCredentialDocument | null = null

    try {
      if (document) {
        preparedDocument = await prepareDegreeDocument(document)
      }

      return await db.transaction(async (tx) => {
        const existingDegree =
          // await CredentialRepository.findDegreeForDocumentUpdate(
          //   tx,
          //   employeeId,
          //   degreeId,
          // )
          await degreeDocumentRepository.findForDocumentUpdate(
            tx,
            employeeId,
            degreeId,
          )

        if (!existingDegree) {
          throw new AppError('Degree not found.', 404)
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
            category: DEGREE_FILE_CATEGORY,
            uploadedByUserId: updatedByUserId,
          })

          newDocumentFileId = newFile.id
        }

        const updatedDegree = await CredentialRepository.updateDegree(
          tx,
          degreeId,
          {
            ...data,
            updatedBy: updatedByUserId,
            ...(newDocumentFileId && {
              documentFileId: newDocumentFileId,
              /*
               * Replacing evidence invalidates
               * previous verification.
               */
              isVerified: false,
              verifiedAt: null,
              verifiedBy: null,
              verificationRemarks: null,
            }),
          },
        )

        if (
          newDocumentFileId &&
          existingDegree.documentFileId &&
          existingDegree.documentCategory === DEGREE_FILE_CATEGORY
        ) {
          await CredentialRepository.softDeleteCredentialFile(
            tx,
            existingDegree.documentFileId,
            DEGREE_FILE_CATEGORY,
            updatedByUserId,
          )
        }

        // return {
        //   updatedDegree,
        //   previousStorageKey:
        //     newDocumentFileId &&
        //     existingDegree.documentCategory === DEGREE_FILE_CATEGORY
        //       ? existingDegree.documentStorageKey
        //       : null,
        // }
        return updatedDegree
      })

      //await removeReplacedDocument(result.previousStorageKey)
    } catch (error: unknown) {
      await cleanUpNewDocument(preparedDocument)

      throw error
    }
  },

  updateBoard: async (id: string, data: unknown) =>
    db.transaction((tx) => CredentialRepository.updateBoard(tx, id, data)),

  updateFellowship: async (id: string, data: unknown) =>
    db.transaction((tx) => CredentialRepository.updateFellowship(tx, id, data)),

  updateMembership: async (id: string, data: unknown) =>
    db.transaction((tx) => CredentialRepository.updateMembership(tx, id, data)),

  updateLicense: async (id: string, data: unknown) =>
    db.transaction((tx) => CredentialRepository.updateLicense(tx, id, data)),

  updateLifeSupport: async (id: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.updateLifeSupport(tx, id, data),
    ),

  updateMalpractice: async (id: string, data: unknown) =>
    db.transaction((tx) =>
      CredentialRepository.updateMalpractice(tx, id, data),
    ),

  softDeleteDegree: async ({
    employeeId,
    degreeId,
    deletedByUserId,
  }: {
    employeeId: string
    degreeId: string
    deletedByUserId: string
  }) => {
    return await db.transaction(async (tx) => {
      const existingDegree =
        await degreeDocumentRepository.findForDocumentUpdate(
          tx,
          employeeId,
          degreeId,
        )

      if (!existingDegree) {
        throw new AppError('Degree not found.', 404)
      }

      await CredentialRepository.softDeleteDegree(tx, degreeId, deletedByUserId)

      if (
        existingDegree.documentFileId &&
        existingDegree.documentCategory === DEGREE_FILE_CATEGORY
      ) {
        await CredentialRepository.softDeleteCredentialFile(
          tx,
          existingDegree.documentFileId,
          DEGREE_FILE_CATEGORY,
          deletedByUserId,
        )
      }

      // return {
      //   storageKey:
      //     existingDegree.documentCategory === DEGREE_FILE_CATEGORY
      //       ? existingDegree.documentStorageKey
      //       : null,
      // }
    })

    //await removeReplacedDocument(result.storageKey)
  },

  softDeleteBoard: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteBoard(tx, id, userId),
    ),

  softDeleteFellowship: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteFellowship(tx, id, userId),
    ),

  softDeleteMembership: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteMembership(tx, id, userId),
    ),

  softDeleteLicense: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteLicense(tx, id, userId),
    ),

  softDeleteLifeSupport: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteLifeSupport(tx, id, userId),
    ),

  softDeleteMalpractice: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteMalpractice(tx, id, userId),
    ),
}
