import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from 'drizzle-orm'
import { DB } from '../../../../db'
import {
  contracts,
  countries,
  departments,
  employees,
  employments,
  positionItems,
  positions,
} from '../../../../db/schema'
import { latestContractMovement } from '../../../../core/utils/current-assignment.query'
import { EmployeeDirectoryQueryDto } from '../dto/employee.request'
import { latestEmployment } from '../../../../core/utils/latest-employment.query'

export const EmployeeDirectoryRepository = {
  async findRange(tx: DB, params: EmployeeDirectoryQueryDto) {
    const {
      offset,
      limit,
      search,
      genders,
      nationalities,
      departmentIds,
      positionIds,
      categoryCodes,
      employmentStatuses,
      sortBy,
      sortOrder,
    } = params
    const latestMovement = latestContractMovement(tx)
    const latestEmploymentRow = latestEmployment(tx)

    const conditions = [
      eq(employees.isDeleted, false),
      isNull(employees.deletedAt),
    ]

    //--------------------------------
    // Search
    //--------------------------------

    if (search) {
      conditions.push(
        or(
          ilike(employees.employeeNumber, `%${search}%`),
          ilike(employees.firstNameEn, `%${search}%`),
          ilike(employees.secondNameEn, `%${search}%`),
          ilike(employees.thirdNameEn, `%${search}%`),
          ilike(employees.familyNameEn, `%${search}%`),
          ilike(employees.firstNameAr, `%${search}%`),
          ilike(employees.secondNameAr, `%${search}%`),
          ilike(employees.thirdNameAr, `%${search}%`),
          ilike(employees.familyNameAr, `%${search}%`),
        )!,
      )
    }

    //--------------------------------
    // Gender
    //--------------------------------

    if (genders?.length) {
      conditions.push(inArray(employees.gender, genders as any[]))
    }

    //--------------------------------
    // Nationality
    //--------------------------------

    if (nationalities?.length) {
      conditions.push(inArray(countries.alpha2, nationalities))
    }

    //--------------------------------
    // Department
    //--------------------------------

    if (departmentIds?.length) {
      conditions.push(
        inArray(latestMovement.officialDepartmentId, departmentIds),
      )
    }

    //--------------------------------
    //Position
    //--------------------------------

    if (positionIds?.length) {
      conditions.push(inArray(latestMovement.officialPositionId, positionIds))
    }

    //--------------------------------
    // Category
    //--------------------------------

    if (categoryCodes?.length) {
      conditions.push(inArray(positionItems.categoryCode, categoryCodes))
    }

    //--------------------------------
    // Employment Status
    //--------------------------------

    // if (employmentStatuses?.length) {
    //   conditions.push(inArray(employments.status, employmentStatuses as any[]))
    // }
    if (employmentStatuses?.length) {
      conditions.push(
        inArray(latestEmploymentRow.status, employmentStatuses as any[]),
      )
    }

    //--------------------------------
    // Sorting
    //--------------------------------

    const sortableColumns = {
      employeeNumber: employees.employeeNumber,
      //hireDate: employments.hireDate,
      hireDate: latestEmploymentRow.hireDate,
      department: departments.nameEn,
      position: positions.titleEn,
      categoryCode: positionItems.categoryCode,
      nationality: countries.nationalityEn,
      gender: employees.gender,
      createdAt: employees.createdAt,
    }

    // const latestMovement = tx
    //   .select({
    //     contractId: contractMovements.contractId,
    //     maxSequence: sql<number>`max(${contractMovements.sequenceNumber})`,
    //   })
    //   .from(contractMovements)
    //   .groupBy(contractMovements.contractId)
    //   .as('latestMovement')

    const sortColumn =
      sortableColumns[sortBy as keyof typeof sortableColumns] ??
      employees.employeeNumber

    //--------------------------------
    // Query
    //--------------------------------

    const [items, totalResult] = await Promise.all([
      tx
        .select({
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
          nationalityEn: countries.nationalityEn,
          nationalityAr: countries.nationalityAr,
          // hireDate: employments.hireDate,
          // employmentStatus: employments.status,
          hireDate: latestEmploymentRow.hireDate,
          employmentStatus: latestEmploymentRow.status,
          pcn: positionItems.itemNumber,
          categoryCode: positionItems.categoryCode,
          workforceCategory: positionItems.workforceCategory,
          departmentId: departments.id,
          departmentNameEn: departments.nameEn,
          departmentNameAr: departments.nameAr,
          positionId: positions.id,
          positionTitleEn: positions.titleEn,
          positionTitleAr: positions.titleAr,
        })

        .from(employees)
        .leftJoin(countries, eq(employees.countryId, countries.id))

        //--------------------------------
        // Active Employment
        //--------------------------------

        // .leftJoin(
        //   employments,
        //   and(
        //     eq(employments.employeeId, employees.id),
        //     eq(employments.status, 'active'),
        //   ),
        // )
        .leftJoin(
          latestEmploymentRow,
          eq(latestEmploymentRow.employeeId, employees.id),
        )

        //--------------------------------
        // Active Contract
        //--------------------------------

        .leftJoin(
          contracts,
          and(
            eq(contracts.employmentId, latestEmploymentRow.id),
            eq(contracts.status, 'active'),
          ),
        )

        //--------------------------------
        // Current Contract Movement
        //--------------------------------

        // .leftJoin(
        //   contractMovements,
        //   and(
        //     eq(contractMovements.contractId, contracts.id),
        //     isNull(contractMovements.endDate),
        //   ),
        // )

        // .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))
        // .leftJoin(
        //   contractMovements,
        //   and(
        //     eq(contractMovements.contractId, latestMovement.contractId),
        //     eq(contractMovements.sequenceNumber, latestMovement.maxSequence),
        //   ),
        // )
        .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))

        //--------------------------------
        // PCN
        //--------------------------------

        .leftJoin(
          positionItems,
          eq(positionItems.id, latestMovement.positionItemId),
        )

        //--------------------------------
        // Official Department
        //--------------------------------

        .leftJoin(
          departments,
          eq(departments.id, latestMovement.officialDepartmentId),
        )

        //--------------------------------
        // Official Position
        //--------------------------------

        .leftJoin(
          positions,
          eq(positions.id, latestMovement.officialPositionId),
        )
        .where(and(...conditions))
        .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
        .offset(offset)
        .limit(limit),

      //--------------------------------
      // Count
      //--------------------------------

      tx
        .select({
          count: sql<number>`count(*)`,
        })

        .from(employees)

        .leftJoin(countries, eq(employees.countryId, countries.id))

        // .leftJoin(
        //   employments,
        //   and(
        //     eq(employments.employeeId, employees.id),
        //     eq(employments.status, 'active'),
        //   ),
        // )
        .leftJoin(
          latestEmploymentRow,
          eq(latestEmploymentRow.employeeId, employees.id),
        )

        // .leftJoin(
        //   contracts,
        //   and(
        //     eq(contracts.employmentId, employments.id),
        //     eq(contracts.status, 'active'),
        //   ),
        // )
        .leftJoin(
          contracts,
          and(
            eq(contracts.employmentId, latestEmploymentRow.id),
            eq(contracts.status, 'active'),
          ),
        )

        .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))

        .leftJoin(
          positionItems,
          eq(positionItems.id, latestMovement.positionItemId),
        )

        .leftJoin(
          departments,
          eq(departments.id, latestMovement.officialDepartmentId),
        )

        .leftJoin(
          positions,
          eq(positions.id, latestMovement.officialPositionId),
        )
        .where(and(...conditions)),
    ])

    return {
      items,
      total: Number(totalResult[0]?.count ?? 0),
      offset,
      limit,
    }
  },
}
