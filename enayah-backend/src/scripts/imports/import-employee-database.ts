import ExcelJS from 'exceljs'
import { and, eq, InferInsertModel } from 'drizzle-orm'
import { db } from '../../db'
import {
  appointments,
  compensations,
  contractMovements,
  contracts,
  countries,
  departments,
  employees,
  employments,
  positionItems,
  positions,
} from '../../db/schema'

import { ImportSummary } from './import.types'
import {
  assertExists,
  cleanString,
  getCell,
  getCellValue,
} from './excel.helpers'
import { normalizeDate } from './date.helpers'
import { generateSequenceNumber } from './db.helpers'

type EmploymentInsert = InferInsertModel<typeof employments>
type EmployeeInsert = InferInsertModel<typeof employees>

function normalizeGender(value: string | null): EmployeeInsert['gender'] {
  if (!value) return null

  const gender = value.toLowerCase().trim()

  if (gender === 'male') return 'male'
  if (gender === 'female') return 'female'

  return null
}

type WorkforceCategory =
  | 'physician'
  | 'nurse'
  | 'allied_health'
  | 'administrative'
  | 'support_service'
  | null

type DatabaseRow = {
  code: string | null
  deptNameEn: string | null
  deptNameAr: string | null

  oldItemNumber: string | null
  itemNumber: string | null
  category: string | null
  status: string | null

  jobNameEn: string | null
  jobNameAr: string | null

  employeeNumber: string | null

  firstNameEn: string | null
  secondNameEn: string | null
  thirdNameEn: string | null
  familyNameEn: string | null

  familyNameAr: string | null
  thirdNameAr: string | null
  secondNameAr: string | null
  firstNameAr: string | null

  gender: string | null
  dateOfBirth: string | null
  nationality: string | null

  hireDate: string | null
  startDate: string | null
  endDate: string | null
}

function getWorkforceCategory(category: string | null): WorkforceCategory {
  if (!category) return null

  const categoryNum = Number(category)

  if (Number.isNaN(categoryNum)) return null

  if (categoryNum >= 1000 && categoryNum < 2000) return 'physician'
  if (categoryNum >= 2000 && categoryNum < 3000) return 'nurse'
  if (categoryNum >= 3000 && categoryNum < 4000) return 'allied_health'
  if (categoryNum >= 4000 && categoryNum < 5000) return 'administrative'
  if (categoryNum >= 5000) return 'support_service'

  return null
}

export async function importEmployeeDatabase(
  workbook: ExcelJS.Workbook,
): Promise<ImportSummary> {
  const sheet = workbook.getWorksheet('Database')

  if (!sheet) {
    throw new Error('Sheet "Database" not found')
  }

  const rows: DatabaseRow[] = []

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    rows.push({
      code: getCell(row, 1),
      deptNameEn: getCell(row, 2),
      deptNameAr: getCell(row, 3),

      oldItemNumber: getCell(row, 4),
      itemNumber: getCell(row, 5),
      category: getCell(row, 6),
      status: getCell(row, 7),

      jobNameEn: getCell(row, 8),
      jobNameAr: getCell(row, 9),

      employeeNumber: getCell(row, 10),

      firstNameEn: getCell(row, 11),
      secondNameEn: getCell(row, 12),
      thirdNameEn: getCell(row, 13),
      familyNameEn: getCell(row, 14),

      familyNameAr: getCell(row, 15),
      thirdNameAr: getCell(row, 16),
      secondNameAr: getCell(row, 17),
      firstNameAr: getCell(row, 18),

      gender: getCell(row, 19),
      dateOfBirth: normalizeDate(getCellValue(row, 20)),
      nationality: getCell(row, 21),

      hireDate: normalizeDate(getCellValue(row, 22)),
      startDate: normalizeDate(getCellValue(row, 23)),
      endDate: normalizeDate(getCellValue(row, 24)),
    })
  })

  const summary: ImportSummary = {
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  for (const row of rows) {
    try {
      await db.transaction(async (tx) => {
        if (
          !row.code ||
          !row.deptNameEn ||
          !row.deptNameAr ||
          !row.itemNumber ||
          !row.category ||
          !row.jobNameEn
        ) {
          summary.skipped++
          summary.errors.push(
            `Skipped row: missing required department/item/job data. Employee: ${
              row.employeeNumber ?? 'N/A'
            }`,
          )
          return
        }

        let foundDepartment = await tx.query.departments.findFirst({
          where: eq(departments.code, row.code),
        })

        if (!foundDepartment) {
          const [created] = await tx
            .insert(departments)
            .values({
              code: row.code,
              nameEn: row.deptNameEn,
              nameAr: row.deptNameAr,
            })
            .returning()

          foundDepartment = assertExists(created, 'Failed to create department')
        }

        const department = assertExists(foundDepartment, 'Department missing')

        let foundPosition = await tx.query.positions.findFirst({
          where: eq(positions.titleEn, row.jobNameEn),
        })

        if (!foundPosition) {
          const [created] = await tx
            .insert(positions)
            .values({
              titleEn: row.jobNameEn,
              titleAr: cleanString(row.jobNameAr),
            })
            .returning()

          foundPosition = assertExists(created, 'Failed to create position')
        }

        const position = assertExists(foundPosition, 'Position missing')

        // let positionItem = await tx.query.positionItems.findFirst({
        //   where: eq(positionItems.itemNumber, row.itemNumber),
        // })

        const workforceCategory = getWorkforceCategory(row.category)

        let foundPositionItem = await tx.query.positionItems.findFirst({
          where: eq(positionItems.itemNumber, row.itemNumber),
        })

        if (!foundPositionItem) {
          const [created] = await tx
            .insert(positionItems)
            .values({
              itemNumber: row.itemNumber,
              oldItemNumber: cleanString(row.oldItemNumber),
              departmentId: department.id,
              positionId: position.id,
              workforceCategory,
              categoryCode: Number(row.category),
              status: row.status || 'filled',
            })
            .returning()

          foundPositionItem = assertExists(
            created,
            'Failed to create position item',
          )
        }

        const positionItem = assertExists(
          foundPositionItem,
          'Position Item missing',
        )

        const country = row.nationality
          ? await tx.query.countries.findFirst({
              where: eq(countries.name, row.nationality),
            })
          : null

        if (positionItem.status !== 'filled') {
          summary.skipped++
          return
        }

        if (
          !row.employeeNumber ||
          !row.firstNameEn ||
          !row.familyNameEn ||
          !row.firstNameAr ||
          !row.familyNameAr ||
          !row.hireDate ||
          !row.startDate ||
          !row.endDate
        ) {
          summary.skipped++
          summary.errors.push(
            `Skipped row: missing required employee/contract data. Employee: ${
              row.employeeNumber ?? 'N/A'
            }`,
          )
          return
        }

        let foundEmployee = await tx.query.employees.findFirst({
          where: eq(employees.employeeNumber, row.employeeNumber),
        })

        const employeeData: EmployeeInsert = {
          employeeNumber: row.employeeNumber,
          firstNameEn: row.firstNameEn,
          secondNameEn: cleanString(row.secondNameEn),
          thirdNameEn: cleanString(row.thirdNameEn),
          familyNameEn: row.familyNameEn,
          firstNameAr: row.firstNameAr,
          secondNameAr: cleanString(row.secondNameAr),
          thirdNameAr: cleanString(row.thirdNameAr),
          familyNameAr: row.familyNameAr,
          gender: normalizeGender(row.gender),
          dateOfBirth: row.dateOfBirth,
          countryId: country?.id ?? null,
        }

        if (!foundEmployee) {
          const [created] = await tx
            .insert(employees)
            .values(employeeData)
            .returning()

          foundEmployee = assertExists(created, 'Failed to create employee')
        }

        const employee = assertExists(foundEmployee, 'Employee missing')

        const employmentExists = await tx.query.employments.findFirst({
          where: and(
            eq(employments.employeeId, employee.id),
            eq(employments.hireDate, row.hireDate),
            eq(employments.startDate, row.startDate),
          ),
        })

        if (employmentExists) {
          summary.skipped++
          return
        }

        const employmentData: EmploymentInsert = {
          employeeId: employee.id,
          hireDate: row.hireDate,
          startDate: row.startDate,
          employmentType: 'full_time',
          staffCategory: 'contractual',
          status: 'active',
        }

        const [employment] = await tx
          .insert(employments)
          .values(employmentData)
          .returning()

        const createdEmployment = assertExists(
          employment,
          'Failed to create employment',
        )

        const hireYear = row.hireDate.substring(0, 4)
        const contractNumber = await generateSequenceNumber(tx, hireYear)

        const [contract] = await tx
          .insert(contracts)
          .values({
            employmentId: createdEmployment.id,
            contractNumber,
            startDate: row.startDate,
            endDate: row.endDate,
            contractType: 'initial',
            status: 'active',
          })
          .returning()

        const createdContract = assertExists(
          contract,
          'Failed to create contract',
        )

        const [movement] = await tx
          .insert(contractMovements)
          .values({
            contractId: createdContract.id,
            positionItemId: positionItem.id,
            officialDepartmentId: department.id,
            officialPositionId: position.id,
            startDate: row.startDate,
            endDate: row.endDate,
            sequenceNumber: 1,
            movementType: 'initial',
            remarks: null,
          })
          .returning()

        const createdMovement = assertExists(
          movement,
          'Failed to create movement',
        )

        await tx.insert(compensations).values({
          contractMovementId: createdMovement.id,
          effectiveDate: row.startDate,
          baseSalary: '0',
          status: 'approved',
          reason: 'initial',
        })

        await tx.insert(appointments).values({
          employmentId: createdEmployment.id,
          actualDepartmentId: department.id,
          actualPositionId: position.id,
          startDate: row.startDate,
          appointmentType: 'primary',
          assignmentReason: 'service_need',
        })

        // keep all your existing import logic here

        summary.imported++
        console.log(`✅ Imported: ${row.employeeNumber}`)
      })
    } catch (error) {
      summary.failed++

      summary.errors.push(
        `${row.employeeNumber ?? 'N/A'}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )

      console.error(`❌ Failed row: ${row.employeeNumber}`, error)
    }
  }

  console.log('🎉 Employee database import completed', summary)

  return summary
}
