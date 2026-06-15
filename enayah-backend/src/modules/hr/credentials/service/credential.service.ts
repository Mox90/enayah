// src/modules/hr/credentials/service/credential.service.ts

import { db } from '../../../../db'
import { CredentialRepository } from '../repository/credential.repository'
import { CreateEmployeeCredentialsDto } from '../dto/credential.request'

export const CredentialService = {
  findByEmployeeId: async (employeeId: string) => {
    return CredentialRepository.findByEmployeeId(db, employeeId)
  },

  createAll: async (employeeId: string, data: CreateEmployeeCredentialsDto) => {
    return db.transaction((tx) =>
      CredentialRepository.createAll(tx, employeeId, data),
    )
  },

  createDegree: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createDegree(tx, employeeId, data),
    ),

  createBoard: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createBoard(tx, employeeId, data),
    ),

  createFellowship: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createFellowship(tx, employeeId, data),
    ),

  createMembership: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createMembership(tx, employeeId, data),
    ),

  createLicense: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createLicense(tx, employeeId, data),
    ),

  createLifeSupport: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createLifeSupport(tx, employeeId, data),
    ),

  createMalpractice: async (employeeId: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.createMalpractice(tx, employeeId, data),
    ),

  updateDegree: async (id: string, data: any) =>
    db.transaction((tx) => CredentialRepository.updateDegree(tx, id, data)),

  updateBoard: async (id: string, data: any) =>
    db.transaction((tx) => CredentialRepository.updateBoard(tx, id, data)),

  updateFellowship: async (id: string, data: any) =>
    db.transaction((tx) => CredentialRepository.updateFellowship(tx, id, data)),

  updateMembership: async (id: string, data: any) =>
    db.transaction((tx) => CredentialRepository.updateMembership(tx, id, data)),

  updateLicense: async (id: string, data: any) =>
    db.transaction((tx) => CredentialRepository.updateLicense(tx, id, data)),

  updateLifeSupport: async (id: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.updateLifeSupport(tx, id, data),
    ),

  updateMalpractice: async (id: string, data: any) =>
    db.transaction((tx) =>
      CredentialRepository.updateMalpractice(tx, id, data),
    ),

  softDeleteDegree: async (id: string, userId?: string) =>
    db.transaction((tx) =>
      CredentialRepository.softDeleteDegree(tx, id, userId),
    ),

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
