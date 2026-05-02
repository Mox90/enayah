import * as XLSX from 'xlsx'
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
import { eq } from 'drizzle-orm'

const workbook = XLSX.readFile('./Database.xlsx')
const sheet = workbook.Sheets['Database']

if (!sheet) {
  throw new Error(`Sheet "Database" not found in Excel file`)
}

const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
  //range: 1, // 🔥 start row 2
  defval: null, // 🔥 set empty cells to null
})

export async function runImport() {
  for (const row of rows) {
    await db.transaction(async (tx) => {
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
            code: row.code,
            nameEn: row.deptNameEn,
            nameAr: row.deptNameAr,
          })
          .returning()

        department = created
      }

      // =========================
      // 2. POSITION
      // =========================
      let position = await tx.query.positions.findFirst({
        where: eq(positions.titleEn, row.jobNameEn),
      })

      if (!position) {
        const [created] = await tx
          .insert(positions)
          .values({
            titleEn: row.jobNameEn,
            titleAr: row.jobNameAr,
          })
          .returning()

        position = created
      }

      // =========================
      // 3. POSITION ITEM
      // =========================
      let positionItem = await tx.query.positionItems.findFirst({
        where: eq(positionItems.itemNumber, row.itemNumber),
      })

      if (!positionItem) {
        const [created] = await tx
          .insert(positionItems)
          .values({
            itemNumber: row.itemNumber,
            oldItemNumber: row.oldItemNumber,
            departmentId: department.id,
            positionId: position.id,
            categoryCode: Number(row.category),
            status: row.status || 'filled',
          })
          .returning()

        positionItem = created
      }

      // =========================
      // 4. COUNTRY (NATIONALITY)
      // =========================
      const country = await tx.query.countries.findFirst({
        where: eq(countries.name, row.nationality),
      })

      // =========================
      // 5. EMPLOYEE
      // =========================
      const [employee] = await tx
        .insert(employees)
        .values({
          employeeNumber: row.employeeNumber,
          firstNameEn: row.firstNameEn,
          secondNameEn: row.secondNameEn,
          thirdNameEn: row.thirdNameEn,
          familyNameEn: row.familyNameEn,
          firstNameAr: row.firstNameAr,
          secondNameAr: row.secondNameAr,
          thirdNameAr: row.thirdNameAr,
          familyNameAr: row.familyNameAr,
          gender: row.gender?.toLowerCase(),
          dateOfBirth: parseDate(row.dateOfBirth),
          countryId: country?.id,
        })
        .returning()

      // =========================
      // 6. EMPLOYMENT
      // =========================
      const [employment] = await tx
        .insert(employments)
        .values({
          employeeId: employee.id,
          positionItemId: positionItem.id,
          hireDate: parseDate(row.hireDate),
          startDate: parseDate(row.startDate),
          endDate: parseDate(row.endDate),
          employmentType: 'full_time',
          staffCategory: 'contractual',
          status: 'active',
        })
        .returning()

      // =========================
      // 7. CONTRACT
      // =========================
      const contractType =
        new Date(row.hireDate) >= new Date('2025-05-01') ? 'initial' : 'renewal'

      await tx.insert(contracts).values({
        employmentId: employment.id,
        startDate: parseDate(row.startDate),
        endDate: parseDate(row.endDate),
        contractType,
      })

      // =========================
      // 8. JOB ASSIGNMENT
      // =========================
      await tx.insert(jobAssignments).values({
        employmentId: employment.id,
        departmentId: department.id,
        positionId: position.id,
        startDate: new Date(row.startDate),
        isPrimary: true,
      })
    })

    //console.log(rows)
    console.log(
      row.code,
      row.deptNameEn,
      row.itemNumber,
      row.category,
      row.status,
      row.employeeNumber,
    )
  }

  console.log('✅ Import completed')
}

// =========================
// HELPERS
// =========================
function parseDate(value: string): Date {
  if (!value) return null as any

  const [day, month, year] = value.split('/')
  return new Date(`${year}-${month}-${day}`)
}
