// src/modules/hr/hiring/service/hiring.service.ts

import { db } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'
import { HireEmployeeDto } from '../dto/hiring.request'

import { EmployeeRepository } from '../../employees/repository/employee.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
import { JobAssignmentRepository } from '../../job-assignments/repository/jobAssignment.repository'

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

      // JOB Assignment
      if (dto.jobAssignment) {
        await JobAssignmentRepository.create(tx, {
          employmentId: employment.id,
          ...dto.jobAssignment,
          isPrimary: true,
        })
      }

      return {
        employee,
        employment,
      }
    })
  },
}
