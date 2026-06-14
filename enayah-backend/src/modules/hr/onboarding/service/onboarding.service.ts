// src/modules/hr/hiring/service/hiring.service.ts

import { db } from '../../../../db'
import { AppError } from '../../../../core/errors/AppError'

import { EmployeeRepository } from '../../employees/repository/employee.repository'
import { EmploymentRepository } from '../../employments/repository/employment.repository'
//import { JobAssignmentRepository } from '../../job-assignments/repository/jobAssignment.repository'
import { ContractRepository } from '../../contracts/repository/contract.repository'
import { CompensationRepository } from '../../compensations/repository/compensation.repository'
import { OnboardingSubmitDto } from '../dto/onboarding.request'
import { EmployeePersonalRepository } from '../../employees/repository/employee-personal.repository'
import { PositionItemRepository } from '../../position-items/repository/positionItem.repository'
import {
  CredentialRepository,
  CredentialPayload,
} from '../../credentials/repository/credential.repository'
import { ContractMovementRepository } from '../../contract-movements/repository/contract-movement.repository'
import { AppointmentRepository } from '../../appointments/repository/appointment.repository'
import { CompensationAllowanceRepository } from '../../compensations/repository/compensation-allowance.repository'

export const OnboardingService = {
  submit: async (dto: OnboardingSubmitDto) => {
    return db.transaction(async (tx) => {
      // ----------------------------------
      // 1. Employee master record
      // ----------------------------------

      const employee = await EmployeeRepository.create(tx, dto.employee)

      // ----------------------------------
      // 2. Personal details
      // ----------------------------------

      const personal = dto.personal
        ? await EmployeePersonalRepository.createAll(
            tx,
            employee.id,
            dto.personal,
          )
        : null

      // ----------------------------------
      // 3. Employment
      // ----------------------------------

      if (!dto.employment) {
        throw new AppError('Employment details are required', 400)
      }

      const employment = await EmploymentRepository.create(tx, {
        ...dto.employment,
        employeeId: employee.id,
      })

      // ----------------------------------
      // 4. Contract
      // ----------------------------------

      if (!dto.contract) {
        throw new AppError('Contract details are required', 400)
      }

      const contractNumber =
        dto.contract.contractNumber ??
        `CN-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

      if (dto.contract.startDate !== dto.employment.startDate) {
        throw new AppError(
          'Contract startDate must match employment startDate',
          400,
        )
      }

      const contract = await ContractRepository.create(tx, {
        ...dto.contract,
        contractNumber,
        employmentId: employment.id,
        contractType: dto.contract.contractType ?? 'initial',
        status: dto.contract.status ?? 'active',
      })

      // ----------------------------------
      // 5. Initial Contract Movement / PCN
      // ----------------------------------

      if (!dto.movement?.positionItemId) {
        throw new AppError('Position item is required for assignment', 400)
      }

      const positionItem = await PositionItemRepository.findById(
        tx,
        dto.movement.positionItemId,
      )

      if (!positionItem) {
        throw new AppError('Position item not found', 404)
      }

      if (positionItem.status !== 'vacant') {
        throw new AppError('Position item is not vacant', 400)
      }

      const movement = await ContractMovementRepository.create(tx, {
        contractId: contract.id,
        positionItemId: positionItem.id,
        officialDepartmentId: positionItem.departmentId,
        officialPositionId: positionItem.positionId,
        startDate: dto.movement.startDate ?? dto.contract.startDate,
        endDate: dto.movement.endDate ?? null,
        sequenceNumber: 1,
        movementType: 'initial',
        remarks: dto.movement.remarks ?? null,
      })

      await PositionItemRepository.updateStatus(tx, positionItem.id, 'filled')

      // ----------------------------------
      // 6. Appointment / Actual Assignment
      // ----------------------------------

      const appointment = dto.appointment
        ? await AppointmentRepository.create(tx, {
            ...dto.appointment,
            employmentId: employment.id,
            startDate: dto.appointment.startDate ?? dto.contract.startDate,
          })
        : null

      // ----------------------------------
      // 7. Compensation
      // ----------------------------------

      let compensation = null

      let allowances: unknown[] = []

      if (dto.compensation) {
        if (dto.compensation.effectiveDate !== dto.contract.startDate) {
          throw new AppError(
            'Compensation effectiveDate must match contract startDate',
            400,
          )
        }

        compensation = await CompensationRepository.create(tx, {
          ...dto.compensation,
          contractMovementId: movement.id,
        })

        if (dto.allowances?.length) {
          allowances = await CompensationAllowanceRepository.createMany(
            tx,
            compensation.id,
            dto.allowances,
          )
        }
      }

      // ----------------------------------
      // 8. Credentials
      // ----------------------------------

      const credentialPayload: CredentialPayload = {
        degrees: dto.credentials?.degrees ?? [],
        boards: dto.credentials?.boards ?? [],
        fellowships: dto.credentials?.fellowships ?? [],
        memberships: dto.credentials?.memberships ?? [],
        licenses: dto.credentials?.licenses ?? [],
        lifeSupport: dto.credentials?.lifeSupport ?? [],
        malpractice: dto.credentials?.malpractice ?? [],
      }

      const credentials = dto.credentials
        ? await CredentialRepository.createAll(
            tx,
            employee.id,
            credentialPayload,
          )
        : null

      // ----------------------------------
      // 9. Return completed onboarding
      // ----------------------------------

      return {
        employee,
        personal,
        employment,
        contract,
        movement,
        appointment,
        compensation,
        allowances,
        credentials,
      }
    })
  },
}
