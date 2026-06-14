// src/modules/hr/credentials/repository/credential.repository.ts

import { eq } from 'drizzle-orm'
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

export type CredentialPayload = {
  degrees?: Omit<typeof employeeDegrees.$inferInsert, 'employeeId'>[]
  boards?: Omit<typeof employeeBoards.$inferInsert, 'employeeId'>[]
  fellowships?: Omit<typeof employeeFellowships.$inferInsert, 'employeeId'>[]
  memberships?: Omit<typeof employeeMemberships.$inferInsert, 'employeeId'>[]
  licenses?: Omit<typeof employeeLicenses.$inferInsert, 'employeeId'>[]
  lifeSupport?: Omit<
    typeof employeeLifeSupportCertifications.$inferInsert,
    'employeeId'
  >[]
  malpractice?: Omit<
    typeof employeeMalpracticeInsurance.$inferInsert,
    'employeeId'
  >[]
}

function hasItems<T>(items?: T[] | null): items is T[] {
  return Array.isArray(items) && items.length > 0
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
        where: eq(employeeDegrees.employeeId, employeeId),
      }),

      tx.query.employeeBoards.findMany({
        where: eq(employeeBoards.employeeId, employeeId),
      }),

      tx.query.employeeFellowships.findMany({
        where: eq(employeeFellowships.employeeId, employeeId),
      }),

      tx.query.employeeMemberships.findMany({
        where: eq(employeeMemberships.employeeId, employeeId),
      }),

      tx.query.employeeLicenses.findMany({
        where: eq(employeeLicenses.employeeId, employeeId),
      }),

      tx.query.employeeLifeSupportCertifications.findMany({
        where: eq(employeeLifeSupportCertifications.employeeId, employeeId),
      }),

      tx.query.employeeMalpracticeInsurance.findMany({
        where: eq(employeeMalpracticeInsurance.employeeId, employeeId),
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
    credentials: CredentialPayload = {},
  ) => {
    const degreesInput = credentials.degrees ?? []
    const boardsInput = credentials.boards ?? []
    const fellowshipsInput = credentials.fellowships ?? []
    const membershipsInput = credentials.memberships ?? []
    const licensesInput = credentials.licenses ?? []
    const lifeSupportInput = credentials.lifeSupport ?? []
    const malpracticeInput = credentials.malpractice ?? []

    const [
      degrees,
      boards,
      fellowships,
      memberships,
      licenses,
      lifeSupport,
      malpractice,
    ] = await Promise.all([
      degreesInput.length
        ? tx
            .insert(employeeDegrees)
            .values(degreesInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      boardsInput.length
        ? tx
            .insert(employeeBoards)
            .values(boardsInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      fellowshipsInput.length
        ? tx
            .insert(employeeFellowships)
            .values(fellowshipsInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      membershipsInput.length
        ? tx
            .insert(employeeMemberships)
            .values(membershipsInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      licensesInput.length
        ? tx
            .insert(employeeLicenses)
            .values(licensesInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      lifeSupportInput.length
        ? tx
            .insert(employeeLifeSupportCertifications)
            .values(lifeSupportInput.map((item) => ({ ...item, employeeId })))
            .returning()
        : [],

      malpracticeInput.length
        ? tx
            .insert(employeeMalpracticeInsurance)
            .values(malpracticeInput.map((item) => ({ ...item, employeeId })))
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
}
