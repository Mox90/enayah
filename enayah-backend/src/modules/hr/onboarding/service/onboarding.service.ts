// enayah-backend/src/modules/hr/onboarding/service/onboarding.service.ts

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
import { RunningNumberService } from '../../../../core/service/running-number.service'

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
        endDate: null,
        status: 'active',
        //causeOfLeaving: null,
      })

      // ----------------------------------
      // 4. Contract
      // ----------------------------------

      if (!dto.contract) {
        throw new AppError('Contract details are required', 400)
      }

      const contractNumber =
        dto.contract.contractNumber ??
        (await RunningNumberService.generate(tx, 'CONTRACT'))

      if (dto.contract.startDate !== dto.employment.startDate) {
        throw new AppError(
          'Contract startDate must match employment startDate',
          400,
        )
      }

      if (dto.contract.endDate < dto.contract.startDate) {
        throw new AppError(
          'Contract endDate must be on or after contract startDate',
          400,
        )
      }

      const contract = await ContractRepository.create(tx, {
        ...dto.contract,
        contractNumber,
        employmentId: employment.id,
        // contractType: dto.contract.contractType ?? 'initial',
        // status: dto.contract.status ?? 'active',
        contractType: 'initial',
        status: 'active',
      })

      // ----------------------------------
      // 5. Initial Contract Movement / PCN
      // ----------------------------------

      const requiresPositionItem =
        dto.employment.staffCategory === 'civilian' ||
        dto.employment.staffCategory === 'contractual'

      let positionItem = null

      if (dto.movement.positionItemId) {
        positionItem = await PositionItemRepository.assignIfAvailable(
          tx,
          dto.movement.positionItemId,
        )

        if (!positionItem) {
          throw new AppError(
            'Position item not found or is no longer vacant',
            409,
          )
        }
      } else if (requiresPositionItem) {
        // Defensive service validation.
        // Zod should already reject this.
        throw new AppError(
          'Position item is required for civilian and contractual employees',
          400,
        )
      }

      const officialDepartmentId =
        positionItem?.departmentId ?? dto.movement.officialDepartmentId

      const officialPositionId =
        positionItem?.positionId ?? dto.movement.officialPositionId

      if (!officialDepartmentId) {
        throw new AppError(
          'Official department is required for the legal assignment',
          400,
        )
      }

      if (!officialPositionId) {
        throw new AppError(
          'Official position is required for the legal assignment',
          400,
        )
      }

      const movement = await ContractMovementRepository.create(tx, {
        contractId: contract.id,
        positionItemId: positionItem?.id ?? null,
        officialDepartmentId,
        officialPositionId,
        startDate: contract.startDate,
        endDate: contract.endDate,
        sequenceNumber: 1,
        movementType: 'initial',
        remarks: dto.movement.remarks ?? null,
      })

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

      //let allowances: unknown[] = []

      if (dto.allowances?.length && !dto.compensation) {
        throw new AppError(
          'Compensation is required when allowances are provided',
          400,
        )
      }

      if (dto.compensation) {
        if (dto.compensation.effectiveDate !== dto.contract.startDate) {
          throw new AppError(
            'Compensation effectiveDate must match contract startDate',
            400,
          )
        }

        compensation = dto.compensation
          ? await CompensationRepository.create(tx, {
              ...dto.compensation,
              contractMovementId: movement.id,
              allowances: dto.allowances ?? [],
            })
          : null

        // if (dto.allowances?.length) {
        //   allowances = await CompensationAllowanceRepository.createMany(
        //     tx,
        //     compensation.id,
        //     dto.allowances,
        //   )
        // }
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
        //allowances: compensation?.allowances ?? [],
        credentials,
      }
    })
  },
}
