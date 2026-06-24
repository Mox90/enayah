import { version } from 'node:os'
import { AppError } from '../../../../core/errors/AppError'
import { latestContractMovement } from '../../../../core/utils/current-assignment.query'

import {
  DB,
  employees,
  employments,
  contracts,
  positionItems,
  departments,
  positions,
  countries,
} from '../../../../db'

import { and, desc, eq, isNull, sql } from 'drizzle-orm'

const isActive = and(
  eq(employees.isDeleted, false),
  isNull(employees.deletedAt),
)

export const EmployeeProfileRepository = {
  async findProfile(tx: DB, employeeId: string) {
    // ------------------------------------
    // latest movement per contract
    // ------------------------------------

    const latestMovement = latestContractMovement(tx)

    const result = await tx
      .select({
        // ---------------------
        // Personal
        // ---------------------

        id: employees.id,

        employeeNumber: employees.employeeNumber,

        firstNameEn: employees.firstNameEn,
        secondNameEn: employees.secondNameEn,
        thirdNameEn: employees.thirdNameEn,
        familyNameEn: employees.familyNameEn,

        firstNameAr: employees.firstNameAr,
        secondNameAr: employees.secondNameAr,
        thirdNameAr: employees.thirdNameAr,
        familyNameAr: employees.familyNameAr,

        gender: employees.gender,
        dateOfBirth: employees.dateOfBirth,

        nationality: {
          id: countries.id,
          name: countries.name,
          nameAr: countries.nameAr,
          nationalityEn: countries.nationalityEn,
          nationalityAr: countries.nationalityAr,
          alpha2: countries.alpha2,
          alpha3: countries.alpha3,
          numericCode: countries.numericCode,
        },
        version: employees.version,

        // ---------------------
        // Employment
        // ---------------------

        employmentId: employments.id,

        hireDate: employments.hireDate,
        startDate: employments.startDate,
        endDate: employments.endDate,

        employmentType: employments.employmentType,
        staffCategory: employments.staffCategory,
        employmentStatus: employments.status,

        // ---------------------
        // Contract
        // ---------------------

        contractId: contracts.id,
        contractNumber: contracts.contractNumber,
        contractType: contracts.contractType,
        contractStartDate: contracts.startDate,
        contractEndDate: contracts.endDate,

        // ---------------------
        // Movement
        // ---------------------

        //movementId: contractMovements.id,
        //movementType: contractMovements.movementType,
        //sequenceNumber: contractMovements.sequenceNumber,
        movementId: latestMovement.id,
        movementType: latestMovement.movementType,
        sequenceNumber: latestMovement.sequenceNumber,

        // ---------------------
        // PCN
        // ---------------------

        positionItemId: positionItems.id,
        itemNumber: positionItems.itemNumber,
        categoryCode: positionItems.categoryCode,
        workforceCategory: positionItems.workforceCategory,

        // ---------------------
        // Department
        // ---------------------

        departmentId: departments.id,
        departmentNameEn: departments.nameEn,
        departmentNameAr: departments.nameAr,

        // ---------------------
        // Position
        // ---------------------

        positionId: positions.id,
        positionTitleEn: positions.titleEn,
        positionTitleAr: positions.titleAr,
      })

      .from(employees)
      .leftJoin(countries, eq(employees.countryId, countries.id))
      .leftJoin(
        employments,
        and(
          eq(employments.employeeId, employees.id),
          eq(employments.status, 'active'),
        ),
      )
      .leftJoin(
        contracts,
        and(
          eq(contracts.employmentId, employments.id),
          eq(contracts.status, 'active'),
        ),
      )
      // .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))
      // .leftJoin(
      //   contractMovements,
      //   and(
      //     eq(contractMovements.contractId, latestMovement.contractId),
      //     eq(contractMovements.sequenceNumber, latestMovement.maxSequence),
      //   ),
      // )
      .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))
      .leftJoin(
        positionItems,
        eq(positionItems.id, latestMovement.positionItemId),
      )

      .leftJoin(
        departments,
        eq(departments.id, latestMovement.officialDepartmentId),
      )

      .leftJoin(positions, eq(positions.id, latestMovement.officialPositionId))

      .where(and(eq(employees.id, employeeId), isActive))
      .limit(1)

    const employee = result[0]

    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    return employee
  },
}
