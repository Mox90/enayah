import { and, eq } from 'drizzle-orm'
//import { DB } from '../../../../db'
import {
  employeeAddresses,
  employeeDependents,
  employeeEmails,
  employeeEmergencyContacts,
  employeeIdentifications,
  employeePhoneNumbers,
  employeeVisas,
} from '../../../../db/schema'
import { DB } from '../../../../db/client'
import { AppError } from '../../../../core/errors/AppError'
import {
  CreateEmployeePersonalDto,
  EmployeeAddressDto,
  EmployeeDependentDto,
  EmployeeEmailDto,
  EmployeeEmergencyContactDto,
  EmployeeIdentificationDto,
  EmployeePhoneNumberDto,
  EmployeeVisaDto,
  UpdateEmployeeAddressDto,
  UpdateEmployeeDependentDto,
  UpdateEmployeeEmailDto,
  UpdateEmployeeEmergencyContactDto,
  UpdateEmployeeIdentificationDto,
  UpdateEmployeePhoneNumberDto,
  UpdateEmployeeVisaDto,
} from '../dto/employee-personal.request'

type DbOrTx = DB

type Table =
  | typeof employeeIdentifications
  | typeof employeeEmails
  | typeof employeePhoneNumbers
  | typeof employeeDependents
  | typeof employeeAddresses
  | typeof employeeEmergencyContacts
  | typeof employeeVisas

const hasItems = <T>(items?: T[] | null): items is T[] => {
  return Array.isArray(items) && items.length > 0
}

const removeUndefined = <T extends Record<string, any>>(data: T) => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

const softDeleteRecord = async (
  tx: DbOrTx,
  table: any,
  id: string,
  userId?: string,
) => {
  const [deleted] = await tx
    .update(table)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      ...(userId && { deletedBy: userId }),
    })
    .where(and(eq(table.id, id), eq(table.isDeleted, false)))
    .returning()

  if (!deleted) {
    throw new AppError('Record not found', 404)
  }

  return deleted
}

const updateRecord = async <T extends Table>(
  tx: DB,
  table: any,
  id: string,
  data: Record<string, any>,
) => {
  const cleanData = removeUndefined(data)

  const [updated] = await tx
    .update(table)
    .set({
      ...cleanData,
      updatedAt: new Date(),
    })
    .where(and(eq(table.id, id), eq(table.isDeleted, false)))
    .returning()

  if (!updated) {
    throw new AppError('Record not found', 404)
  }

  return updated
}

export const EmployeePersonalRepository = {
  // =====================================================
  // FULL READ
  // =====================================================

  findByEmployeeId: async (tx: DB, employeeId: string) => {
    const [
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    ] = await Promise.all([
      tx.query.employeeIdentifications.findMany({
        where: and(
          eq(employeeIdentifications.employeeId, employeeId),
          eq(employeeIdentifications.isDeleted, false),
        ),
      }),

      tx.query.employeeEmails.findMany({
        where: and(
          eq(employeeEmails.employeeId, employeeId),
          eq(employeeEmails.isDeleted, false),
        ),
      }),

      tx.query.employeePhoneNumbers.findMany({
        where: and(
          eq(employeePhoneNumbers.employeeId, employeeId),
          eq(employeePhoneNumbers.isDeleted, false),
        ),
      }),

      tx.query.employeeDependents.findMany({
        where: and(
          eq(employeeDependents.employeeId, employeeId),
          eq(employeeDependents.isDeleted, false),
        ),
      }),

      tx.query.employeeAddresses.findMany({
        where: and(
          eq(employeeAddresses.employeeId, employeeId),
          eq(employeeAddresses.isDeleted, false),
        ),
      }),

      tx.query.employeeEmergencyContacts.findMany({
        where: and(
          eq(employeeEmergencyContacts.employeeId, employeeId),
          eq(employeeEmergencyContacts.isDeleted, false),
        ),
      }),

      tx.query.employeeVisas.findMany({
        where: and(
          eq(employeeVisas.employeeId, employeeId),
          eq(employeeVisas.isDeleted, false),
        ),
      }),
    ])

    return {
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    }
  },

  // =====================================================
  // CREATE
  // =====================================================

  createAll: async (
    tx: DB,
    employeeId: string,
    data: CreateEmployeePersonalDto,
  ) => {
    const [
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    ] = await Promise.all([
      hasItems(data.identifications)
        ? tx
            .insert(employeeIdentifications)
            .values(
              data.identifications.map((x: EmployeeIdentificationDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.emails)
        ? tx
            .insert(employeeEmails)
            .values(
              data.emails.map((x: EmployeeEmailDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.phoneNumbers)
        ? tx
            .insert(employeePhoneNumbers)
            .values(
              data.phoneNumbers.map((x: EmployeePhoneNumberDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.dependents)
        ? tx
            .insert(employeeDependents)
            .values(
              data.dependents.map((x: EmployeeDependentDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.addresses)
        ? tx
            .insert(employeeAddresses)
            .values(
              data.addresses.map((x: EmployeeAddressDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.emergencyContacts)
        ? tx
            .insert(employeeEmergencyContacts)
            .values(
              data.emergencyContacts.map((x: EmployeeEmergencyContactDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],

      hasItems(data.visas)
        ? tx
            .insert(employeeVisas)
            .values(
              data.visas.map((x: EmployeeVisaDto) => ({
                ...x,
                employeeId,
              })),
            )
            .returning()
        : [],
    ])

    return {
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    }
  },

  // =====================================================
  // UPDATE SINGLE RECORD
  // =====================================================

  updateIdentification: (
    tx: DB,
    id: string,
    data: UpdateEmployeeIdentificationDto,
  ) => updateRecord(tx, employeeIdentifications, id, data),

  updateEmail: (tx: DB, id: string, data: UpdateEmployeeEmailDto) =>
    updateRecord(tx, employeeEmails, id, data),

  updatePhoneNumber: (tx: DB, id: string, data: UpdateEmployeePhoneNumberDto) =>
    updateRecord(tx, employeePhoneNumbers, id, data),

  updateDependent: (tx: DB, id: string, data: UpdateEmployeeDependentDto) =>
    updateRecord(tx, employeeDependents, id, data),

  updateAddress: (tx: DB, id: string, data: UpdateEmployeeAddressDto) =>
    updateRecord(tx, employeeAddresses, id, data),

  updateEmergencyContact: (
    tx: DB,
    id: string,
    data: UpdateEmployeeEmergencyContactDto,
  ) => updateRecord(tx, employeeEmergencyContacts, id, data),

  updateVisa: (tx: DB, id: string, data: UpdateEmployeeVisaDto) =>
    updateRecord(tx, employeeVisas, id, data),

  // =====================================================
  // SOFT DELETE SINGLE RECORD
  // =====================================================

  softDeleteIdentification: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeIdentifications, id, userId),

  softDeleteEmail: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeEmails, id, userId),

  softDeletePhoneNumber: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeePhoneNumbers, id, userId),

  softDeleteDependent: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeDependents, id, userId),

  softDeleteAddress: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeAddresses, id, userId),

  softDeleteEmergencyContact: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeEmergencyContacts, id, userId),

  softDeleteVisa: (tx: DB, id: string, userId?: string) =>
    softDeleteRecord(tx, employeeVisas, id, userId),
}

/*export const EmployeePersonalRepository = {
  // ----------------------------------
  // Identifications
  // ----------------------------------

  createIdentifications: async (
    tx: DbOrTx,
    employeeId: string,
    identifications?: (typeof employeeIdentifications.$inferInsert)[],
  ) => {
    if (!hasItems(identifications)) return []

    return tx
      .insert(employeeIdentifications)
      .values(
        identifications.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findIdentificationsByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeIdentifications.findMany({
      where: eq(employeeIdentifications.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Emails
  // ----------------------------------

  createEmails: async (
    tx: DbOrTx,
    employeeId: string,
    emails?: (typeof employeeEmails.$inferInsert)[],
  ) => {
    if (!hasItems(emails)) return []

    return tx
      .insert(employeeEmails)
      .values(
        emails.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findEmailsByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeEmails.findMany({
      where: eq(employeeEmails.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Phone Numbers
  // ----------------------------------

  createPhoneNumbers: async (
    tx: DbOrTx,
    employeeId: string,
    phoneNumbers?: (typeof employeePhoneNumbers.$inferInsert)[],
  ) => {
    if (!hasItems(phoneNumbers)) return []

    return tx
      .insert(employeePhoneNumbers)
      .values(
        phoneNumbers.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findPhoneNumbersByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeePhoneNumbers.findMany({
      where: eq(employeePhoneNumbers.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Dependents
  // ----------------------------------

  createDependents: async (
    tx: DbOrTx,
    employeeId: string,
    dependents?: (typeof employeeDependents.$inferInsert)[],
  ) => {
    if (!hasItems(dependents)) return []

    return tx
      .insert(employeeDependents)
      .values(
        dependents.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findDependentsByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeDependents.findMany({
      where: eq(employeeDependents.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Addresses
  // ----------------------------------

  createAddresses: async (
    tx: DbOrTx,
    employeeId: string,
    addresses?: (typeof employeeAddresses.$inferInsert)[],
  ) => {
    if (!hasItems(addresses)) return []

    return tx
      .insert(employeeAddresses)
      .values(
        addresses.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findAddressesByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeAddresses.findMany({
      where: eq(employeeAddresses.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Emergency Contacts
  // ----------------------------------

  createEmergencyContacts: async (
    tx: DbOrTx,
    employeeId: string,
    emergencyContacts?: (typeof employeeEmergencyContacts.$inferInsert)[],
  ) => {
    if (!hasItems(emergencyContacts)) return []

    return tx
      .insert(employeeEmergencyContacts)
      .values(
        emergencyContacts.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findEmergencyContactsByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeEmergencyContacts.findMany({
      where: eq(employeeEmergencyContacts.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Visas
  // ----------------------------------

  createVisas: async (
    tx: DbOrTx,
    employeeId: string,
    visas?: (typeof employeeVisas.$inferInsert)[],
  ) => {
    if (!hasItems(visas)) return []

    return tx
      .insert(employeeVisas)
      .values(
        visas.map((item) => ({
          ...item,
          employeeId,
        })),
      )
      .returning()
  },

  findVisasByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    return tx.query.employeeVisas.findMany({
      where: eq(employeeVisas.employeeId, employeeId),
    })
  },

  // ----------------------------------
  // Full Personal Details
  // ----------------------------------

  findPersonalDetailsByEmployeeId: async (tx: DbOrTx, employeeId: string) => {
    const [
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    ] = await Promise.all([
      EmployeePersonalRepository.findIdentificationsByEmployeeId(
        tx,
        employeeId,
      ),

      EmployeePersonalRepository.findEmailsByEmployeeId(tx, employeeId),
      EmployeePersonalRepository.findPhoneNumbersByEmployeeId(tx, employeeId),
      EmployeePersonalRepository.findDependentsByEmployeeId(tx, employeeId),
      EmployeePersonalRepository.findAddressesByEmployeeId(tx, employeeId),
      EmployeePersonalRepository.findEmergencyContactsByEmployeeId(
        tx,
        employeeId,
      ),

      EmployeePersonalRepository.findVisasByEmployeeId(tx, employeeId),
    ])

    return {
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    }
  },

  // ----------------------------------
  // Create All Personal Details
  // ----------------------------------

  createAll: async (
    tx: DbOrTx,
    employeeId: string,
    data: {
      identifications?: (typeof employeeIdentifications.$inferInsert)[]
      emails?: (typeof employeeEmails.$inferInsert)[]
      phoneNumbers?: (typeof employeePhoneNumbers.$inferInsert)[]
      dependents?: (typeof employeeDependents.$inferInsert)[]
      addresses?: (typeof employeeAddresses.$inferInsert)[]
      emergencyContacts?: (typeof employeeEmergencyContacts.$inferInsert)[]
      visas?: (typeof employeeVisas.$inferInsert)[]
    },
  ) => {
    const [
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    ] = await Promise.all([
      EmployeePersonalRepository.createIdentifications(
        tx,
        employeeId,
        data.identifications,
      ),
      EmployeePersonalRepository.createEmails(tx, employeeId, data.emails),
      EmployeePersonalRepository.createPhoneNumbers(
        tx,
        employeeId,
        data.phoneNumbers,
      ),
      EmployeePersonalRepository.createDependents(
        tx,
        employeeId,
        data.dependents,
      ),
      EmployeePersonalRepository.createAddresses(
        tx,
        employeeId,
        data.addresses,
      ),
      EmployeePersonalRepository.createEmergencyContacts(
        tx,
        employeeId,
        data.emergencyContacts,
      ),
      EmployeePersonalRepository.createVisas(tx, employeeId, data.visas),
    ])
    return {
      identifications,
      emails,
      phoneNumbers,
      dependents,
      addresses,
      emergencyContacts,
      visas,
    }
  },
}*/
