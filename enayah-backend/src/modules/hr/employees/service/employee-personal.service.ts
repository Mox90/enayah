//import { db } from '../../../../db'
import { db } from '../../../../db/client'
import { EmployeePersonalRepository } from '../repository/employee-personal.repository'
import {
  CreateEmployeePersonalDto,
  UpdateEmployeeAddressDto,
  UpdateEmployeeDependentDto,
  UpdateEmployeeEmailDto,
  UpdateEmployeeEmergencyContactDto,
  UpdateEmployeeIdentificationDto,
  UpdateEmployeePhoneNumberDto,
  UpdateEmployeeVisaDto,
} from '../dto/employee-personal.request'

export const EmployeePersonalService = {
  findByEmployeeId: async (employeeId: string) => {
    return EmployeePersonalRepository.findByEmployeeId(db, employeeId)
  },

  createAll: async (employeeId: string, data: CreateEmployeePersonalDto) => {
    return db.transaction(async (tx) => {
      return EmployeePersonalRepository.createAll(tx, employeeId, data)
    })
  },

  updateIdentification: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeIdentificationDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateIdentification(tx, employeeId, id, data),
    )
  },

  updateEmail: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeEmailDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateEmail(tx, employeeId, id, data),
    )
  },

  updatePhoneNumber: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeePhoneNumberDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updatePhoneNumber(tx, employeeId, id, data),
    )
  },

  updateDependent: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeDependentDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateDependent(tx, employeeId, id, data),
    )
  },

  updateAddress: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeAddressDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateAddress(tx, employeeId, id, data),
    )
  },

  updateEmergencyContact: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeEmergencyContactDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateEmergencyContact(
        tx,
        employeeId,
        id,
        data,
      ),
    )
  },

  updateVisa: async (
    employeeId: string,
    id: string,
    data: UpdateEmployeeVisaDto,
  ) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.updateVisa(tx, employeeId, id, data),
    )
  },

  softDeleteIdentification: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteIdentification(tx, id, userId),
    )
  },

  softDeleteEmail: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteEmail(tx, id, userId),
    )
  },

  softDeletePhoneNumber: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeletePhoneNumber(tx, id, userId),
    )
  },

  softDeleteDependent: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteDependent(tx, id, userId),
    )
  },

  softDeleteAddress: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteAddress(tx, id, userId),
    )
  },

  softDeleteEmergencyContact: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteEmergencyContact(tx, id, userId),
    )
  },

  softDeleteVisa: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      EmployeePersonalRepository.softDeleteVisa(tx, id, userId),
    )
  },
}
