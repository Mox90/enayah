// Configured each credential domain

// enayah-backend/src/modules/hr/credentials/repository/credential-verification-repositories.ts

import {
  employeeBoards,
  employeeDegrees,
  employeeFellowships,
  employeeLicenses,
  employeeLifeSupportCertifications,
  employeeMalpracticeInsurance,
  employeeMemberships,
} from '../../../../db'

import {
  createCredentialVerificationRepository,
  type CredentialVerificationWriteInput,
} from './credential-verification.repository'

function buildVerificationValues(input: CredentialVerificationWriteInput) {
  return {
    isVerified: input.isVerified,
    verifiedAt: input.isVerified ? input.occurredAt : null,
    verifiedBy: input.isVerified ? input.actorUserId : null,
    verificationRemarks: input.remarks,
    updatedBy: input.actorUserId,
    updatedAt: input.occurredAt,
  }
}

export const degreeVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeDegrees,

    columns: {
      id: employeeDegrees.id,
      employeeId: employeeDegrees.employeeId,
      isDeleted: employeeDegrees.isDeleted,
      deletedAt: employeeDegrees.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const boardVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeBoards,

    columns: {
      id: employeeBoards.id,
      employeeId: employeeBoards.employeeId,
      isDeleted: employeeBoards.isDeleted,
      deletedAt: employeeBoards.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const fellowshipVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeFellowships,

    columns: {
      id: employeeFellowships.id,
      employeeId: employeeFellowships.employeeId,
      isDeleted: employeeFellowships.isDeleted,
      deletedAt: employeeFellowships.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const membershipVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeMemberships,

    columns: {
      id: employeeMemberships.id,
      employeeId: employeeMemberships.employeeId,
      isDeleted: employeeMemberships.isDeleted,
      deletedAt: employeeMemberships.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const licenseVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeLicenses,

    columns: {
      id: employeeLicenses.id,
      employeeId: employeeLicenses.employeeId,
      isDeleted: employeeLicenses.isDeleted,
      deletedAt: employeeLicenses.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const lifeSupportVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeLifeSupportCertifications,

    columns: {
      id: employeeLifeSupportCertifications.id,
      employeeId: employeeLifeSupportCertifications.employeeId,
      isDeleted: employeeLifeSupportCertifications.isDeleted,
      deletedAt: employeeLifeSupportCertifications.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })

export const malpracticeVerificationRepository =
  createCredentialVerificationRepository({
    table: employeeMalpracticeInsurance,

    columns: {
      id: employeeMalpracticeInsurance.id,
      employeeId: employeeMalpracticeInsurance.employeeId,
      isDeleted: employeeMalpracticeInsurance.isDeleted,
      deletedAt: employeeMalpracticeInsurance.deletedAt,
    },

    buildUpdateSet: buildVerificationValues,
  })
