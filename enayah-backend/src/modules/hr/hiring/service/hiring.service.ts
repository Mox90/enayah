// src/modules/hr/hiring/service/hiring.service.ts

import { db } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { HireEmployeeDto } from '../dto/hiring.request'

import { EmployeeRepository } from '../../employees/repository/employee.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { JobAssignmentRepository } from '../../job-assignments/repository/jobAssignment.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { CompensationRepository } from '../../compensations/repository/compensation.repository'

export const HiringService = {
  hire: async (dto: HireEmployeeDto) => {
    return db.transaction(async (tx) => {
      const employee = await EmployeeRepository.create(tx, dto.employee)
      /*
      const existing = await EmploymentRepository.findActiveByEmployee(
        tx,
        employee.id,
      )

      if (existing) {
        throw new AppError('Employee already has active employment', 400)
      }*/

      if (
        (dto.employment.staffCategory === 'civilian' ||
          dto.employment.staffCategory === 'contractual') &&
        !dto.employment.positionItemId
      ) {
        throw new AppError('Position item required', 400)
      }

      // Employment (handles reservation internally)
      const employment = await EmploymentRepository.create(tx, {
        ...dto.employment,
        employeeId: employee.id,
      })

      let contract = null
      if (dto.contract) {
        if (dto.contract.startDate !== dto.employment.startDate) {
          throw new AppError(
            'Contract startDate must match employment startDat',
            400,
          )
        }

        contract = await ContractRepository.create(tx, {
          ...dto.contract,
          employmentId: employment.id,
        })
      }

      // JOB Assignment
      if (dto.jobAssignment) {
        await JobAssignmentRepository.create(tx, {
          employmentId: employment.id,
          ...dto.jobAssignment,
          isPrimary: true,
        })
      }

      if (dto.compensation) {
        if (!dto.contract) {
          throw new AppError(
            'Compensation requires a legal contract basis',
            400,
          )
        }

        if (dto.compensation.effectiveDate !== dto.contract.startDate) {
          throw new AppError(
            'Compensation must align with contract startDate',
            400,
          )
        }

        await CompensationRepository.create(tx, {
          ...dto.compensation,
          employmentId: employment.id,
        })
      }

      return {
        employee,
        employment,
        ...(contract && { contract }),
      }
    })
  },
}
