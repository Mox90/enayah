// src/modules/hr/credentials/repository/credential.repository.ts

import { and, eq, sql } from 'drizzle-orm'
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
} from '../../../../db'
import { CreateEmployeeCredentialsDto } from '../dto/credential.request'

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

async function findOneOrThrow(tx: DB, table: any, id: string, name: string) {
  // const row = await tx.query[table._.name].findFirst({
  //   where: and(eq(table.id, id), eq(table.isDeleted, false)),
  // })
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
      tx.query.employeeDegrees.findMany({
        where: and(
          eq(employeeDegrees.employeeId, employeeId),
          eq(employeeDegrees.isDeleted, false),
        ),
        orderBy: (a, { desc }) => [
          //desc(a.graduationDate),
          sql`${a.graduationDate} DESC NULLS LAST`,
          sql`
            CASE ${a.degreeType} 
              WHEN 'doctorate' THEN 1 
              WHEN 'master' THEN 2 
              WHEN 'bachelor' THEN 3 
              WHEN 'diploma' THEN 4 
              WHEN 'associate' THEN 5 
              WHEN 'other' THEN 6 
              ELSE 7 
            END ASC
          `,
        ],
      }),

      tx.query.employeeBoards.findMany({
        where: and(
          eq(employeeBoards.employeeId, employeeId),
          eq(employeeBoards.isDeleted, false),
        ),
        orderBy: (a, { desc }) => [
          //desc(a.issueDate)
          sql`${a.issueDate} DESC NULLS LAST`,
        ],
      }),

      tx.query.employeeFellowships.findMany({
        where: and(
          eq(employeeFellowships.employeeId, employeeId),
          eq(employeeFellowships.isDeleted, false),
        ),
        orderBy: (a) => [sql`${a.issueDate} DESC NULLS LAST`],
      }),

      tx.query.employeeMemberships.findMany({
        where: and(
          eq(employeeMemberships.employeeId, employeeId),
          eq(employeeMemberships.isDeleted, false),
        ),
        orderBy: (a) => [sql`${a.startDate} DESC NULLS LAST`],
      }),

      tx.query.employeeLicenses.findMany({
        where: and(
          eq(employeeLicenses.employeeId, employeeId),
          eq(employeeLicenses.isDeleted, false),
        ),
        orderBy: (a) => [sql`${a.issueDate} DESC NULLS LAST`],
      }),

      tx.query.employeeLifeSupportCertifications.findMany({
        where: and(
          eq(employeeLifeSupportCertifications.employeeId, employeeId),
          eq(employeeLifeSupportCertifications.isDeleted, false),
        ),
        orderBy: (a) => [
          sql`
            CASE ${a.type}
              WHEN 'bls' THEN 1
              WHEN 'acls' THEN 2
              WHEN 'pals' THEN 3
              WHEN 'nrp' THEN 4
              WHEN 'stls' THEN 5
              WHEN 'atls' THEN 6
              WHEN 'itls' THEN 7
              WHEN 'blso' THEN 8
              WHEN 'atcn' THEN 9
              WHEN 'also' THEN 10
              WHEN 'tncc' THEN 11
              WHEN 'enpc' THEN 12
              WHEN 'asls' THEN 13
              WHEN 'esls' THEN 14
              WHEN 'pfccs' THEN 15
              WHEN 'other' THEN 16
              ELSE 17
            END ASC
          `,
        ],
      }),

      tx.query.employeeMalpracticeInsurance.findMany({
        where: and(
          eq(employeeMalpracticeInsurance.employeeId, employeeId),
          eq(employeeMalpracticeInsurance.isDeleted, false),
        ),
      }),
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

      hasItems(credentials.malpractice)
        ? tx
            .insert(employeeMalpracticeInsurance)
            .values(
              credentials.malpractice.map(
                (item) =>
                  ({
                    ...clean(item),
                    employeeId,
                  }) as MalpracticeInsert,
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

  createMalpractice: async (tx: DB, employeeId: string, data: any) => {
    const [row] = await tx
      .insert(employeeMalpracticeInsurance)
      .values({ ...clean(data), employeeId })
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

  updateMalpractice: (tx: DB, id: string, data: any) =>
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
