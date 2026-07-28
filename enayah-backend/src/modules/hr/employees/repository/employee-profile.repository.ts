import { AppError } from '../../../../core/errors/AppError'
import { latestContractMovement } from '../../../../core/utils/current-assignment.query'
import { latestEmployment } from '../../../../core/utils/latest-employment.query'
import { latestContract } from '../../../../core/utils/latest-contract.query'

import {
  DB,
  employees,
  positionItems,
  departments,
  positions,
  countries,
} from '../../../../db'

import { and, eq, isNull, sql } from 'drizzle-orm'

const isActiveEmployeeRecord = and(
  eq(employees.isDeleted, false),
  isNull(employees.deletedAt),
)

export const EmployeeProfileRepository = {
  findProfile: async (tx: DB, employeeId: string) => {
    /*
     * These queries return one deterministic row:
     *
     * Employee
     *   -> latest employment
     *   -> latest contract
     *   -> latest contract movement
     *
     * They must not be limited to active records because former employees
     * still need their last known assignment displayed.
     */
    const latestEmploymentRow = latestEmployment(tx)
    const latestContractRow = latestContract(tx)
    const latestMovementRow = latestContractMovement(tx)

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
        // Latest Employment
        // ---------------------

        employmentId: latestEmploymentRow.id,

        hireDate: latestEmploymentRow.hireDate,
        startDate: latestEmploymentRow.startDate,
        endDate: latestEmploymentRow.endDate,

        employmentType: latestEmploymentRow.employmentType,
        staffCategory: latestEmploymentRow.staffCategory,
        employmentStatus: latestEmploymentRow.status,

        // ---------------------
        // Latest Contract
        // ---------------------

        contractId: latestContractRow.id,
        contractNumber: latestContractRow.contractNumber,
        contractType: latestContractRow.contractType,
        contractStartDate: latestContractRow.startDate,
        contractEndDate: latestContractRow.endDate,

        // ---------------------
        // Latest Movement
        // ---------------------

        movementId: latestMovementRow.id,
        movementType: latestMovementRow.movementType,
        sequenceNumber: latestMovementRow.sequenceNumber,

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

      // Latest employment, including ended/inactive employment.
      .leftJoin(
        latestEmploymentRow,
        eq(latestEmploymentRow.employeeId, employees.id),
      )

      // Latest contract belonging to the latest employment.
      .leftJoin(
        latestContractRow,
        eq(latestContractRow.employmentId, latestEmploymentRow.id),
      )

      // Latest movement belonging to the latest contract.
      .leftJoin(
        latestMovementRow,
        eq(latestMovementRow.contractId, latestContractRow.id),
      )

      .leftJoin(
        positionItems,
        eq(positionItems.id, latestMovementRow.positionItemId),
      )

      .leftJoin(
        departments,
        eq(departments.id, latestMovementRow.officialDepartmentId),
      )

      .leftJoin(
        positions,
        eq(positions.id, latestMovementRow.officialPositionId),
      )

      .where(and(eq(employees.id, employeeId), isActiveEmployeeRecord))

      /*
       * Defensive deterministic ordering.
       *
       * The latest-row helpers should already return only one record each,
       * but this also prevents an arbitrary result if unexpected duplicate
       * rows exist.
       */
      .orderBy(
        sql`${latestEmploymentRow.startDate} desc nulls last`,
        sql`${latestEmploymentRow.hireDate} desc nulls last`,
        sql`${latestContractRow.startDate} desc nulls last`,
        sql`${latestMovementRow.sequenceNumber} desc nulls last`,
      )
      .limit(1)

    const employee = result[0]

    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    return employee
  },
}
