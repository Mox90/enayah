// enayah-backend/src/modules/hr/credentials/repository/credential.repository.ts

import { and, eq, getTableColumns, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import {
  DB,
  employeeBoards,
  employeeDegrees,
  employeeFellowships,
  employeeLicenses,
  employeeLifeSupportCertifications,
  employeeMalpracticeInsurance,
  employeeMemberships,
  files,
} from '../../../../db'

import {
  CreateEmployeeCredentialsDto,
  CreateMalpracticeDto,
  UpdateMalpracticeDto,
} from '../dto/credential.request'
import {
  boardDocumentRepository,
  degreeDocumentRepository,
  fellowshipDocumentRepository,
  membershipDocumentRepository,
  licenseDocumentRepository,
  lifeSupportDocumentRepository,
  malpracticeDocumentRepository,
} from './credential-document-repositories'

export type CredentialPayload = CreateEmployeeCredentialsDto

function hasItems<T>(items?: T[] | null): items is T[] {
  return Array.isArray(items) && items.length > 0
}

function clean<T extends Record<string, unknown>>(data: T): T {
  const {
    id,
    employeeId,
    createdAt,
    updatedAt,
    deletedAt,
    deletedBy,
    isDeleted,
    version,
    ...rest
  } = data as any

  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined),
  ) as T
}

type DegreeInsert = typeof employeeDegrees.$inferInsert
type BoardInsert = typeof employeeBoards.$inferInsert
type FellowshipInsert = typeof employeeFellowships.$inferInsert
type MembershipInsert = typeof employeeMemberships.$inferInsert
type LicenseInsert = typeof employeeLicenses.$inferInsert
type LifeSupportInsert = typeof employeeLifeSupportCertifications.$inferInsert
type MalpracticeInsert = typeof employeeMalpracticeInsurance.$inferInsert

export type CredentialFileCategory = (typeof files.category.enumValues)[number]
export type CreateCredentialFileInput = {
  storedName: string
  originalName: string
  mimeType: string
  fileSize: number
  storageKey: string
  checksumSha256: string
  category: CredentialFileCategory
  uploadedByUserId: string
}

export type DegreeForDocumentUpdate = {
  id: string
  employeeId: string
  documentFileId: string | null
  documentStorageKey: string | null
  documentCategory: CredentialFileCategory | null
}

export type ActiveDegreeDocument = {
  id: string
  degreeId: string
  employeeId: string
  originalName: string
  storedName: string
  mimeType: string
  fileSize: number
  storageKey: string
}

function toMalpracticeInsert(
  employeeId: string,
  item: CreateMalpracticeDto,
): MalpracticeInsert {
  return {
    employeeId,
    insuranceCompany: item.insuranceCompany,
    policyNumber: item.policyNumber,

    coverageAmount: item.coverageAmount.toFixed(2),

    startDate: item.startDate ?? null,
    expiryDate: item.expiryDate,
  }
}

function toMalpracticeUpdate(
  data: UpdateMalpracticeDto,
): Partial<MalpracticeInsert> {
  return {
    ...(data.insuranceCompany !== undefined && {
      insuranceCompany: data.insuranceCompany,
    }),

    ...(data.policyNumber !== undefined && {
      policyNumber: data.policyNumber,
    }),

    ...(data.coverageAmount !== undefined && {
      coverageAmount: data.coverageAmount.toFixed(2),
    }),

    ...(data.startDate !== undefined && {
      startDate: data.startDate,
    }),

    ...(data.expiryDate !== undefined && {
      expiryDate: data.expiryDate,
    }),
  }
}

async function findOneOrThrow(tx: DB, table: any, id: string, name: string) {
  const [row] = await tx
    .select()
    .from(table)
    .where(and(eq(table.id, id), eq(table.isDeleted, false)))
    .limit(1)

  if (!row) throw new AppError(`${name} not found`, 404)

  return row
}

async function updateRecord(
  tx: DB,
  table: any,
  id: string,
  data: Record<string, any>,
  name: string,
) {
  const [row] = await tx
    .update(table)
    .set({
      ...clean(data),
      updatedAt: new Date(),
    })
    .where(and(eq(table.id, id), eq(table.isDeleted, false)))
    .returning({ id: table.id })

  if (!row) throw new AppError(`${name} not found`, 404)

  return findOneOrThrow(tx, table, row.id, name)
}

async function softDeleteRecord(
  tx: DB,
  table: any,
  id: string,
  name: string,
  userId?: string,
) {
  const existing = await findOneOrThrow(tx, table, id, name)

  await tx
    .update(table)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      ...(userId && { deletedBy: userId }),
    })
    .where(and(eq(table.id, id), eq(table.isDeleted, false)))

  return existing
}

export const CredentialRepository = {
  findByEmployeeId: async (tx: DB, employeeId: string) => {
    const [
      degrees,
      boards,
      fellowships,
      memberships,
      licenses,
      lifeSupport,
      malpractice,
    ] = await Promise.all([
      //findDegreesWithDocument(tx, employeeId),
      degreeDocumentRepository.findManyWithDocument(tx, employeeId),
      boardDocumentRepository.findManyWithDocument(tx, employeeId),
      fellowshipDocumentRepository.findManyWithDocument(tx, employeeId),
      membershipDocumentRepository.findManyWithDocument(tx, employeeId),
      licenseDocumentRepository.findManyWithDocument(tx, employeeId),
      lifeSupportDocumentRepository.findManyWithDocument(tx, employeeId),
      malpracticeDocumentRepository.findManyWithDocument(tx, employeeId),
    ])

    return {
      degrees,
      boards,
      fellowships,
      memberships,
      licenses,
      lifeSupport,
      malpractice,
    }
  },

  findActiveDegreeDocument: async (
    tx: DB,
    employeeId: string,
    degreeId: string,
  ) => {
    return degreeDocumentRepository.findActiveDocument(tx, employeeId, degreeId)
  },

  findDegreeForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    degreeId: string,
  ) => {
    return degreeDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      degreeId,
    )
  },

  findActiveBoardDocument: async (
    tx: DB,
    employeeId: string,
    boardId: string,
  ) => {
    return boardDocumentRepository.findActiveDocument(tx, employeeId, boardId)
  },

  findBoardForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    boardId: string,
  ) => {
    return boardDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      boardId,
    )
  },

  findActiveFellowshipDocument: async (
    tx: DB,
    employeeId: string,
    fellowshipId: string,
  ) => {
    return fellowshipDocumentRepository.findActiveDocument(
      tx,
      employeeId,
      fellowshipId,
    )
  },

  findFellowshipForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    fellowshipId: string,
  ) => {
    return fellowshipDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      fellowshipId,
    )
  },

  findActiveMembershipDocument: async (
    tx: DB,
    employeeId: string,
    membershipId: string,
  ) => {
    return membershipDocumentRepository.findActiveDocument(
      tx,
      employeeId,
      membershipId,
    )
  },

  findMembershipForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    membershipId: string,
  ) => {
    return membershipDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      membershipId,
    )
  },

  findActiveLicenseDocument: async (
    tx: DB,
    employeeId: string,
    licenseId: string,
  ) => {
    return licenseDocumentRepository.findActiveDocument(
      tx,
      employeeId,
      licenseId,
    )
  },

  findLicenseForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    licenseId: string,
  ) => {
    return licenseDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      licenseId,
    )
  },

  findActiveLifeSupportDocument: async (
    tx: DB,
    employeeId: string,
    lifeSupportId: string,
  ) => {
    return lifeSupportDocumentRepository.findActiveDocument(
      tx,
      employeeId,
      lifeSupportId,
    )
  },

  findLifeSupportForDocumentUpdate: async (
    tx: DB,
    employeeId: string,
    lifeSupportId: string,
  ) => {
    return lifeSupportDocumentRepository.findForDocumentUpdate(
      tx,
      employeeId,
      lifeSupportId,
    )
  },

  findActiveMalpracticeDocument: async (
    tx: DB,
    employeeId: string,
    malpracticeId: string,
  ) => {
    return malpracticeDocumentRepository.findActiveDocument(
      tx,
      employeeId,
      malpracticeId,
    )
  },

  createCredentialFile: async (
    tx: DB,
    input: CreateCredentialFileInput,
  ): Promise<{
    id: string
    storageKey: string
  }> => {
    const [createdFile] = await tx
      .insert(files)
      .values({
        storedName: input.storedName,
        originalName: input.originalName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
        checksumSha256: input.checksumSha256,
        visibility: 'private',
        category: input.category,
        uploadedByUserId: input.uploadedByUserId,
        createdBy: input.uploadedByUserId,
        updatedBy: input.uploadedByUserId,
      })
      .returning({
        id: files.id,
        storageKey: files.storageKey,
      })

    if (!createdFile) {
      throw new Error(
        'The credential document file record could not be created.',
      )
    }

    return createdFile
  },

  softDeleteCredentialFile: async (
    tx: DB,
    fileId: string,
    category: CredentialFileCategory,
    userId: string,
  ): Promise<void> => {
    await tx
      .update(files)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(
        and(
          eq(files.id, fileId),
          eq(files.category, category),
          eq(files.isDeleted, false),
        ),
      )
  },

  createAll: async (
    tx: DB,
    employeeId: string,
    credentials: CredentialPayload,
  ) => {
    const [
      degrees,
      boards,
      fellowships,
      memberships,
      licenses,
      lifeSupport,
      malpractice,
    ] = await Promise.all([
      hasItems(credentials.degrees)
        ? tx
            .insert(employeeDegrees)
            .values(
              credentials.degrees.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as DegreeInsert,
              ),
            )
            .returning()
        : [],

      hasItems(credentials.boards)
        ? tx
            .insert(employeeBoards)
            .values(
              credentials.boards.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as BoardInsert,
              ),
            )
            .returning()
        : [],

      hasItems(credentials.fellowships)
        ? tx
            .insert(employeeFellowships)
            .values(
              credentials.fellowships.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as FellowshipInsert,
              ),
            )
            .returning()
        : [],

      hasItems(credentials.memberships)
        ? tx
            .insert(employeeMemberships)
            .values(
              credentials.memberships.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as MembershipInsert,
              ),
            )
            .returning()
        : [],

      hasItems(credentials.licenses)
        ? tx
            .insert(employeeLicenses)
            .values(
              credentials.licenses.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as LicenseInsert,
              ),
            )
            .returning()
        : [],

      hasItems(credentials.lifeSupport)
        ? tx
            .insert(employeeLifeSupportCertifications)
            .values(
              credentials.lifeSupport.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as LifeSupportInsert,
              ),
            )
            .returning()
        : [],

      // hasItems(credentials.malpractice)
      //   ? tx
      //       .insert(employeeMalpracticeInsurance)
      //       .values(
      //         credentials.malpractice.map(
      //           (item) =>
      //             ({
      //               ...clean(item),
      //               employeeId,
      //             }) as MalpracticeInsert,
      //         ),
      //       )
      //       .returning()
      //   : [],
      hasItems(credentials.malpractice)
        ? tx
            .insert(employeeMalpracticeInsurance)
            .values(
              credentials.malpractice.map((item) =>
                toMalpracticeInsert(employeeId, item),
              ),
            )
            .returning()
        : [],
    ])

    return {
      degrees,
      boards,
      fellowships,
      memberships,
      licenses,
      lifeSupport,
      malpractice,
    }
  },

  createDegree: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeDegrees)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  createBoard: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeBoards)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  createFellowship: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeFellowships)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  createMembership: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeMemberships)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  createLicense: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeLicenses)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  createLifeSupport: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeLifeSupportCertifications)
      .values({ ...clean(data), employeeId })
      .returning()

    return row
  },

  // createMalpractice: async (tx: DB, employeeId: string, data: any) => {
  //   const [row] = await tx
  //     .insert(employeeMalpracticeInsurance)
  //     .values({ ...clean(data), employeeId })
  //     .returning()

  //   return row
  // },
  createMalpractice: async (
    tx: DB,
    employeeId: string,
    data: CreateMalpracticeDto,
  ) => {
    const [row] = await tx
      .insert(employeeMalpracticeInsurance)
      .values(toMalpracticeInsert(employeeId, data))
      .returning()

    return row
  },

  updateDegree: (tx: DB, id: string, data: any) =>
    updateRecord(tx, employeeDegrees, id, data, 'Degree'),

  updateBoard: (tx: DB, id: string, data: any) =>
    updateRecord(tx, employeeBoards, id, data, 'Board'),

  updateFellowship: (tx: DB, id: string, data: any) =>
    updateRecord(tx, employeeFellowships, id, data, 'Fellowship'),

  updateMembership: (tx: DB, id: string, data: any) =>
    updateRecord(tx, employeeMemberships, id, data, 'Membership'),

  updateLicense: (tx: DB, id: string, data: any) =>
    updateRecord(tx, employeeLicenses, id, data, 'License'),

  updateLifeSupport: (tx: DB, id: string, data: any) =>
    updateRecord(
      tx,
      employeeLifeSupportCertifications,
      id,
      data,
      'Life support certification',
    ),

  updateMalpractice: (tx: DB, id: string, data: UpdateMalpracticeDto) =>
    updateRecord(tx, employeeMalpracticeInsurance, id, data, 'Malpractice'),

  softDeleteDegree: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeDegrees, id, 'Degree', userId),

  softDeleteBoard: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeBoards, id, 'Board', userId),

  softDeleteFellowship: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeFellowships, id, 'Fellowship', userId),

  softDeleteMembership: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeMemberships, id, 'Membership', userId),

  softDeleteLicense: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeLicenses, id, 'License', userId),

  softDeleteLifeSupport: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(
      tx,
      employeeLifeSupportCertifications,
      id,
      'Life support certification',
      userId,
    ),

  softDeleteMalpractice: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(
      tx,
      employeeMalpracticeInsurance,
      id,
      'Malpractice',
      userId,
    ),
}
