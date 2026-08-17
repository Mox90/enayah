import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
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
import { latestContract } from '../../../../core/utils/latest-contract.query'
import { currentIqamaIdentification } from '../../../../core/utils/current-iqama.query'

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
      hireDateFrom,
      hireDateTo,
      contractEndDateFrom,
      contractEndDateTo,
      sortBy,
      sortOrder,
    } = params
    const latestMovement = latestContractMovement(tx)
    const latestEmploymentRow = latestEmployment(tx)
    const latestContractRow = latestContract(tx)

    const currentIqama = currentIqamaIdentification(tx)

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
          ilike(currentIqama.identificationNumber, `%${search}%`),
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

    if (hireDateFrom) {
      conditions.push(gte(latestEmploymentRow.hireDate, hireDateFrom))
    }

    if (hireDateTo) {
      conditions.push(lte(latestEmploymentRow.hireDate, hireDateTo))
    }

    // if (contractEndDateFrom) {
    //   conditions.push(gte(contracts.endDate, contractEndDateFrom))
    // }

    // if (contractEndDateTo) {
    //   conditions.push(lte(contracts.endDate, contractEndDateTo))
    // }
    if (contractEndDateFrom) {
      conditions.push(gte(latestContractRow.endDate, contractEndDateFrom))
    }

    if (contractEndDateTo) {
      conditions.push(lte(latestContractRow.endDate, contractEndDateTo))
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
          //--------------------------------
          // Iqama
          //--------------------------------
          //iqamaId: currentIqama.id,
          //iqamaType: currentIqama.type,
          iqamaNumber: currentIqama.identificationNumber,

          // iqamaIssueDate: currentIqama.issueDate,
          // iqamaExpiryDate: currentIqama.expiryDate,

          // iqamaIssueDateHijri: currentIqama.issueDateHijri,
          // iqamaExpiryDateHijri: currentIqama.expiryDateHijri,

          // iqamaSponsor: currentIqama.sponsor,
          // iqamaIssuingAuthority: currentIqama.issuingAuthority,
          // iqamaOccupation: currentIqama.occupation,

          // iqamaDocumentFileId: currentIqama.documentFileId,
        })

        .from(employees)
        .leftJoin(countries, eq(employees.countryId, countries.id))

        //--------------------------------
        // Current Iqama
        //--------------------------------

        .leftJoin(currentIqama, eq(currentIqama.employeeId, employees.id))

        //--------------------------------
        // Employment
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
        // Contract
        //--------------------------------

        // .leftJoin(
        //   contracts,
        //   and(
        //     eq(contracts.employmentId, latestEmploymentRow.id),
        //     eq(contracts.status, 'active'),
        //   ),
        // )
        .leftJoin(
          latestContractRow,
          eq(latestContractRow.employmentId, latestEmploymentRow.id),
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
        //.leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))
        .leftJoin(
          latestMovement,
          eq(latestMovement.contractId, latestContractRow.id),
        )

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
        .orderBy(
          sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn),
          asc(employees.employeeNumber),
        )
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

        .leftJoin(currentIqama, eq(currentIqama.employeeId, employees.id))

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
        //     eq(contracts.employmentId, latestEmploymentRow.id),
        //     eq(contracts.status, 'active'),
        //   ),
        // )

        // .leftJoin(latestMovement, eq(latestMovement.contractId, contracts.id))
        .leftJoin(
          latestContractRow,
          eq(latestContractRow.employmentId, latestEmploymentRow.id),
        )

        .leftJoin(
          latestMovement,
          eq(latestMovement.contractId, latestContractRow.id),
        )

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
