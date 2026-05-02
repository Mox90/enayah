import { db } from '../../db'
import {
  departments,
  positions,
  positionItems,
  employees,
  employments,
  contracts,
  jobAssignments,
  countries,
} from '../../db/schema'
import { eq, InferInsertModel } from 'drizzle-orm'
import ExcelJS from 'exceljs'

type EmploymentInsert = InferInsertModel<typeof employments>
type ContractInsert = InferInsertModel<typeof contracts>
type JobAssignmentInsert = InferInsertModel<typeof jobAssignments>

// =========================
// HELPERS
// =========================
function cleanString(value: any): string | null {
  if (!value) return null
  const trimmed = value.toString().trim()
  return trimmed.length ? trimmed : null
}

function getCell(row: ExcelJS.Row, index: number): string | null {
  const val = row.getCell(index).value
  if (!val) return null
  return val.toString().trim()
}

function parseDateOnly(value: any): string | null {
  if (!value) return null

  let date: Date | null = null

  // ✅ ExcelJS may already give Date object
  if (value instanceof Date) {
    date = value
  }

  // ✅ Excel serial number
  else if (typeof value === 'number') {
    date = new Date(Math.round((value - 25569) * 86400 * 1000))
  }

  // ✅ ISO string (e.g. 1974-07-20T00:00:00.000Z)
  else if (typeof value === 'string' && value.includes('T')) {
    date = new Date(value)
  }

  // ✅ dd/mm/yyyy
  else if (typeof value === 'string' && value.includes('/')) {
    const [day, month, year] = value.split('/')
    date = new Date(`${year}-${month}-${day}`)
  }

  // ✅ yyyy-mm-dd
  else if (typeof value === 'string' && value.includes('-')) {
    date = new Date(value)
  }

  if (!date || isNaN(date.getTime())) {
    console.warn('⚠️ Invalid date value:', value)
    return null
  }

  return date.toISOString().slice(0, 10)
}

function assertExists<T>(value: T | undefined | null, message: string): T {
  if (!value) throw new Error(message)
  return value
}

// =========================
// MAIN IMPORT
// =========================

export async function runImport() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile('./Database.xlsx')

  const sheet = workbook.getWorksheet('Database')
  if (!sheet) throw new Error('Sheet "Database" not found')

  const rows: any[] = []

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
      dateOfBirth: row.getCell(20).value,
      nationality: getCell(row, 21),

      hireDate: row.getCell(22).value,
      startDate: row.getCell(23).value,
      endDate: row.getCell(24).value,
    })
  })

  console.log(`📦 Rows to import: ${rows.length}`)

  // =========================
  // TRANSACTION (BATCH MODE)
  // =========================

  await db.transaction(async (tx) => {
    for (const row of rows) {
      try {
        // =========================
        // 1. DEPARTMENT
        // =========================
        let department = await tx.query.departments.findFirst({
          where: eq(departments.code, row.code),
        })

        if (!department) {
          const [created] = await tx
            .insert(departments)
            .values({
              code: row.code.trim(),
              nameEn: row.deptNameEn.trim(),
              nameAr: row.deptNameAr.trim(),
            })
            .returning()

          department = assertExists(created, 'Failed to create department')
        }

        // =========================
        // 2. POSITION
        // =========================
        let position = await tx.query.positions.findFirst({
          where: eq(positions.titleEn, row.jobNameEn.trim()),
        })

        if (!position) {
          const [created] = await tx
            .insert(positions)
            .values({
              titleEn: row.jobNameEn.trim(),
              // titleAr: row.jobNameAr.trim(),
            })
            .returning()

          position = assertExists(created, 'Failed to create position')
        }

        // =========================
        // 3. POSITION ITEM
        // =========================
        let positionItem = await tx.query.positionItems.findFirst({
          where: eq(positionItems.itemNumber, row.itemNumber.trim()),
        })
        let workforceCategory: any = null
        if (row.category) {
          const categoryNum = Number(row.category)
          if (categoryNum >= 1000 && categoryNum < 2000)
            workforceCategory = 'physician'
          else if (categoryNum >= 2000 && categoryNum < 3000)
            workforceCategory = 'nurse'
          else if (categoryNum >= 3000 && categoryNum < 4000)
            workforceCategory = 'allied_health'
          else if (categoryNum >= 4000 && categoryNum < 5000)
            workforceCategory = 'administrative'
          else if (categoryNum >= 5000) workforceCategory = 'support_service'
        }

        if (!positionItem) {
          const [created] = await tx
            .insert(positionItems)
            .values({
              itemNumber: row.itemNumber.trim(),
              oldItemNumber: cleanString(row.oldItemNumber),
              departmentId: department.id,
              positionId: position.id,
              workforceCategory,
              categoryCode: Number(row.category),
              status: row.status || 'filled',
            })
            .returning()

          positionItem = assertExists(created, 'Failed to create position item')
        }

        // =========================
        // 4. COUNTRY
        // =========================
        const country = await tx.query.countries.findFirst({
          where: eq(countries.name, row.nationality?.trim()),
        })

        // =========================
        // 5. EMPLOYEE
        // =========================
        if (positionItem.status === 'filled' && row.employeeNumber) {
          let employee = await tx.query.employees.findFirst({
            where: eq(employees.employeeNumber, row.employeeNumber),
          })

          if (!employee) {
            console.log(
              row.code,
              row.deptNameEn,
              row.itemNumber,
              row.status,
              row.employeeNumber,
              row.status === 'filled' ? parseDateOnly(row.dateOfBirth) : null,
            )
            const [created] = await tx
              .insert(employees)
              .values({
                employeeNumber: row.employeeNumber.trim(),
                firstNameEn: row.firstNameEn.trim(),
                secondNameEn: cleanString(row.secondNameEn),
                thirdNameEn: cleanString(row.thirdNameEn),
                familyNameEn: row.familyNameEn.trim(),
                firstNameAr: row.firstNameAr.trim(),
                secondNameAr: cleanString(row.secondNameAr),
                thirdNameAr: cleanString(row.thirdNameAr),
                familyNameAr: row.familyNameAr.trim(),
                gender: row.gender?.toLowerCase().trim(),
                dateOfBirth: parseDateOnly(row.dateOfBirth),
                countryId: country?.id,
              })
              .returning()

            employee = assertExists(created, 'Failed to create employee')
          }

          // =========================
          // ASSERT ALL REQUIRED
          // =========================
          employee = assertExists(employee, 'Employee missing')
          positionItem = assertExists(positionItem, 'PositionItem missing')
          department = assertExists(department, 'Department missing')
          position = assertExists(position, 'Position missing')

          // =========================
          // 6. EMPLOYMENT
          // =========================

          const data: EmploymentInsert = {
            employeeId: employee.id,
            positionItemId: positionItem.id,
            hireDate: parseDateOnly(row.hireDate)!,
            startDate: parseDateOnly(row.startDate)!,
            employmentType: 'full_time',
            staffCategory: 'contractual',
            status: 'active',
          }

          const [employment] = await tx
            .insert(employments)
            .values(data)
            .returning()

          const emp = assertExists(employment, 'Failed to create employment')

          // =========================
          // 7. CONTRACT
          // =========================
          const hireDate = parseDateOnly(row.hireDate)

          const contractType =
            hireDate && new Date(hireDate) >= new Date('2025-05-01')
              ? 'initial'
              : 'renewal'

          const contractData: ContractInsert = {
            employmentId: emp.id,
            startDate: parseDateOnly(row.startDate)!,
            endDate: parseDateOnly(row.endDate),
            contractType,
          } as any

          await tx.insert(contracts).values(contractData)

          // =========================
          // 8. JOB ASSIGNMENT
          // =========================
          const jobAssignmentData: JobAssignmentInsert = {
            employmentId: emp.id,
            departmentId: department.id,
            positionId: position.id,
            startDate: parseDateOnly(row.startDate),
            isPrimary: true,
          } as any

          await tx.insert(jobAssignments).values(jobAssignmentData)

          console.log(`✅ Imported: ${row.employeeNumber}`)
        }
      } catch (err) {
        console.error(`❌ Failed row: ${row.employeeNumber}`, err)
      }
    }
  })

  console.log('🎉 Import completed')
}
