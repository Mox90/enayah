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
}
