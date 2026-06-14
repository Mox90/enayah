import { eq } from 'drizzle-orm'
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

type DbOrTx = DB

function hasItems<T>(items?: T[] | null): items is T[] {
  return Array.isArray(items) && items.length > 0
}

export const EmployeePersonalRepository = {
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
  //   // Dependents
  //   // ----------------------------------

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
}
