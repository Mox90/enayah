import { AppError } from '../../../../core/errors/AppError'
import { db } from '../../../../db'
import { CpdRepository } from '../../cpd/repository/cpd.repository'
import { CredentialRepository } from '../../credentials/repository/credential.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { TrainingRepository } from '../../training/repository/training.repository'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { EmployeeRepository } from '../repository/employee.repository'

export const EmployeeService = {
  async create(data: CreateEmployeeDto) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.create(tx, data)
    })
  },

  async findAll() {
    return EmployeeRepository.findAll(db)
  },

  async findById(id: string) {
    return EmployeeRepository.findById(db, id)
  },

  async update(id: string, data: UpdateEmployeeDto) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.update(tx, id, data)
    })
  },

  async softDelete(id: string, userId?: string) {
    return db.transaction(async (tx) => {
      return EmployeeRepository.softDelete(tx, id, userId)
    })
  },

  // employee.service.ts

  /*

  getEmployees: async (params: EmployeeListQueryDto) => {
    return EmployeeRepository.findRange(db, params)
  },

  getProfile: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      //const [personal, employment, credentials, training, cpd] =
      const [personal, employment, credentials, training, cpd] =
        await Promise.all([
          EmployeeRepository.findProfileBase(tx, employeeId),

          EmploymentRepository.findCurrentEmploymentByEmployeeId(
            tx,
            employeeId,
          ),

          CredentialRepository.findByEmployeeId(tx, employeeId),

          TrainingRepository.findByEmployeeId(tx, employeeId),

          CpdRepository.findByEmployeeId(tx, employeeId),
          //TODO: requires documents as well especially that EmployeeProfileResponse requires it, but we can add that later when we have the documents module ready
        ])

      return {
        personal,
        employment,
        credentials,
        training,
        cpd,
      }
    })
  },

  getProfileSummary: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      //const [personal, employment, credentials, training, cpd] =
      const [personal, employment] = await Promise.all([
        EmployeeRepository.findProfileBase(tx, employeeId),

        EmploymentRepository.findCurrentEmploymentByEmployeeId(tx, employeeId),

        //CredentialRepository.findByEmployeeId(tx, employeeId),

        //TrainingRepository.findByEmployeeId(tx, employeeId),

        //CpdRepository.findByEmployeeId(tx, employeeId),
      ])

      return {
        personal,
        employment,
      }
    })
  },

  getEmployeeTraining: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      //const [personal, employment, credentials, training, cpd] =
      const [training] = await Promise.all([
        //EmployeeRepository.findProfileBase(tx, employeeId),

        //EmploymentRepository.findCurrentEmploymentByEmployeeId(tx, employeeId),

        //CredentialRepository.findByEmployeeId(tx, employeeId),

        TrainingRepository.findByEmployeeId(tx, employeeId),

        //CpdRepository.findByEmployeeId(tx, employeeId),
      ])

      return {
        training,
      }
    })
  },

  getEmployeeCpd: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      //const [personal, employment, credentials, training, cpd] =
      const [cpd] = await Promise.all([
        //EmployeeRepository.findProfileBase(tx, employeeId),

        //EmploymentRepository.findCurrentEmploymentByEmployeeId(tx, employeeId),

        //CredentialRepository.findByEmployeeId(tx, employeeId),

        //TrainingRepository.findByEmployeeId(tx, employeeId),

        CpdRepository.findByEmployeeId(tx, employeeId),
      ])

      return {
        cpd,
      }
    })
  },

  findEmployeeDirectoryRange: async (params: EmployeeDirectoryQueryDto) => {
    return db.transaction((tx) =>
      EmployeeRepository.findEmployeeDirectoryRange(tx, params),
    )
  },*/
}
