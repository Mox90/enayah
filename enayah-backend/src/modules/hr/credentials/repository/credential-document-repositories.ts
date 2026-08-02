//enayah-backend/src/modules/hr/credentials/repository/credential-document-repositories.ts

// usage: para sa one configured repository per domain
import { sql } from 'drizzle-orm'

import {
  employeeBoards,
  employeeDegrees,
  employeeFellowships,
  employeeLicenses,
  employeeLifeSupportCertifications,
  employeeMalpracticeInsurance,
  employeeMemberships,
} from '../../../../db'

import { createCredentialDocumentRepository } from './credential-document.repository'

export const degreeDocumentRepository = createCredentialDocumentRepository({
  table: employeeDegrees,
  columns: {
    id: employeeDegrees.id,
    employeeId: employeeDegrees.employeeId,
    documentFileId: employeeDegrees.documentFileId,
    isDeleted: employeeDegrees.isDeleted,
    deletedAt: employeeDegrees.deletedAt,
  },
  category: 'employee_degree',
  orderBy: [
    sql`
        ${employeeDegrees.graduationDate}
        DESC NULLS LAST
      `,
    sql`
        CASE ${employeeDegrees.degreeType}
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
})

export const boardDocumentRepository = createCredentialDocumentRepository({
  table: employeeBoards,
  columns: {
    id: employeeBoards.id,
    employeeId: employeeBoards.employeeId,
    documentFileId: employeeBoards.documentFileId,
    isDeleted: employeeBoards.isDeleted,
    deletedAt: employeeBoards.deletedAt,
  },
  category: 'employee_board',
  orderBy: [
    sql`
        ${employeeBoards.issueDate}
        DESC NULLS LAST
      `,
  ],
})

export const fellowshipDocumentRepository = createCredentialDocumentRepository({
  table: employeeFellowships,
  columns: {
    id: employeeFellowships.id,
    employeeId: employeeFellowships.employeeId,
    documentFileId: employeeFellowships.documentFileId,
    isDeleted: employeeFellowships.isDeleted,
    deletedAt: employeeFellowships.deletedAt,
  },
  category: 'employee_fellowship',
  orderBy: [
    sql`
        ${employeeFellowships.issueDate}
        DESC NULLS LAST
      `,
  ],
})

export const membershipDocumentRepository = createCredentialDocumentRepository({
  table: employeeMemberships,
  columns: {
    id: employeeMemberships.id,
    employeeId: employeeMemberships.employeeId,
    documentFileId: employeeMemberships.documentFileId,
    isDeleted: employeeMemberships.isDeleted,
    deletedAt: employeeMemberships.deletedAt,
  },
  category: 'employee_membership',
  orderBy: [
    sql`
        ${employeeMemberships.startDate}
        DESC NULLS LAST
      `,
  ],
})

export const licenseDocumentRepository = createCredentialDocumentRepository({
  table: employeeLicenses,
  columns: {
    id: employeeLicenses.id,
    employeeId: employeeLicenses.employeeId,
    documentFileId: employeeLicenses.documentFileId,
    isDeleted: employeeLicenses.isDeleted,
    deletedAt: employeeLicenses.deletedAt,
  },
  category: 'employee_license',
  orderBy: [
    sql`
        ${employeeLicenses.expiryDate}
        ASC NULLS LAST
      `,
  ],
})

export const lifeSupportDocumentRepository = createCredentialDocumentRepository(
  {
    table: employeeLifeSupportCertifications,
    columns: {
      id: employeeLifeSupportCertifications.id,
      employeeId: employeeLifeSupportCertifications.employeeId,
      documentFileId: employeeLifeSupportCertifications.documentFileId,
      isDeleted: employeeLifeSupportCertifications.isDeleted,
      deletedAt: employeeLifeSupportCertifications.deletedAt,
    },
    category: 'employee_life_support',
    orderBy: [
      sql`
        ${employeeLifeSupportCertifications.expiryDate}
        ASC NULLS LAST
      `,
      sql`
            CASE ${employeeLifeSupportCertifications.type}
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
  },
)

export const malpracticeDocumentRepository = createCredentialDocumentRepository(
  {
    table: employeeMalpracticeInsurance,
    columns: {
      id: employeeMalpracticeInsurance.id,
      employeeId: employeeMalpracticeInsurance.employeeId,
      documentFileId: employeeMalpracticeInsurance.documentFileId,
      isDeleted: employeeMalpracticeInsurance.isDeleted,
      deletedAt: employeeMalpracticeInsurance.deletedAt,
    },
    category: 'employee_malpractice',
    orderBy: [
      sql`
        ${employeeMalpracticeInsurance.expiryDate}
        ASC NULLS LAST
      `,
    ],
  },
)
