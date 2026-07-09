import {
  appointments,
  compensations,
  contractMovements,
  db,
  employeeIdentifications,
} from '../../db'
import {
  departments,
  positions,
  positionItems,
  employees,
  employments,
  contracts,
  countries,
} from '../../db/schema'
import { and, desc, eq, InferInsertModel, like, sql } from 'drizzle-orm'
import ExcelJS from 'exceljs'
import moment from 'moment-hijri'

type EmploymentInsert = InferInsertModel<typeof employments>
type ContractInsert = InferInsertModel<typeof contracts>
type ContractMovementInsert = InferInsertModel<typeof contractMovements>
type CompensationInsert = InferInsertModel<typeof compensations>
type AppointmentInsert = InferInsertModel<typeof appointments>

// =========================
// HELPERS
// =========================
function cleanString(value: any): string | null {
  if (!value) return null
  const trimmed = value.toString().trim()
  return trimmed.length ? trimmed : null
}

// function getCell(row: ExcelJS.Row, index: number): string | null {
//   const val = row.getCell(index).value
//   if (!val) return null
//   return val.toString().trim()
// }
function getCell(row: ExcelJS.Row, index: number): string | null {
  const cell = row.getCell(index)
  if (!cell.text) return null
  return cell.text.trim()
}

function getCellValue(row: ExcelJS.Row, index: number): any {
  return row.getCell(index).value
}

function getCellText(row: ExcelJS.Row, index: number): string | null {
  const text = row.getCell(index).text
  return text?.trim() || null
}

function formatDateOnlyLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateOnly(value: any): string | null {
  if (!value) return null

  let date: Date | null = null

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'number') {
    date = new Date(Math.round((value - 25569) * 86400 * 1000))
  } else if (typeof value === 'string' && value.includes('T')) {
    date = new Date(value)
  } else if (typeof value === 'string' && value.includes('/')) {
    const [day, month, year] = value.split('/')
    date = new Date(`${year}-${month}-${day}`)
  } else if (typeof value === 'string' && value.includes('-')) {
    date = new Date(value)
  }

  if (!date || isNaN(date.getTime())) {
    console.warn('⚠️ Invalid date value:', value)

    return null
  }

  return formatDateOnlyLocal(date) // ✅ FIXED
}

// 1. Accept the transaction context 'tx' as the first argument
const generateSequenceNumber = async (
  tx: any,
  hireYear: string,
): Promise<string> => {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${hireYear}))`)

  const latestContract = await tx
    .select({ contractNumber: contracts.contractNumber })
    .from(contracts)
    .where(like(contracts.contractNumber, `${hireYear}-%`))
    .orderBy(desc(contracts.contractNumber))
    .limit(1)
    //.for('update') // ⚠️ Locks the row from other concurrent readers
    .then((res: any[]) => res[0])

  let nextSequence = 1
  if (latestContract?.contractNumber) {
    const currentSequenceStr = latestContract.contractNumber.split('-')[1]
    nextSequence = parseInt(currentSequenceStr ?? '1', 10) + 1
  }

  const paddedSequence = String(nextSequence).padStart(6, '0')
  return `${hireYear}-${paddedSequence}`
}

function assertExists<T>(value: T | undefined | null, message: string): T {
  if (!value) throw new Error(message)
  return value
}

// =========================
// MAIN IMPORT
// =========================

export async function runImport(determiner: number, file: string) {
  const workbook = new ExcelJS.Workbook()
  //await workbook.xlsx.readFile('./Database.xlsx')
  await workbook.xlsx.readFile(file)
  let sheet = null
  //const rows: any[] = []
  switch (determiner) {
    case 1:
      sheet = workbook.getWorksheet('Database')
      if (!sheet) throw new Error('Sheet "Database" not found')

      type DataRow = {
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
        dateOfBirth: string
        nationality: string | null

        hireDate: string | null
        startDate: string | null
        endDate: string | null
      }
      const rows2: DataRow[] = []

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return

        rows2.push({
          code: getCell(row, 1),
          deptNameEn: getCell(row, 2),
          deptNameAr: getCell(row, 3),

          oldItemNumber: getCell(row, 4),
          itemNumber: getCell(row, 5),
          category: getCell(row, 6),
          status: getCell(row, 7),

          jobNameEn: getCell(row, 8),
          jobNameAr: getCell(row, 9),

          employeeNumber: getCell(row, 10)!,

          firstNameEn: getCell(row, 11),
          secondNameEn: getCell(row, 12),
          thirdNameEn: getCell(row, 13),
          familyNameEn: getCell(row, 14),

          familyNameAr: getCell(row, 15),
          thirdNameAr: getCell(row, 16),
          secondNameAr: getCell(row, 17),
          firstNameAr: getCell(row, 18),

          gender: getCell(row, 19),
          dateOfBirth: row.getCell(20).value?.toString() || '',
          nationality: getCell(row, 21),

          hireDate: row.getCell(22).value?.toString() || '',
          startDate: row.getCell(23).value?.toString() || '',
          endDate: row.getCell(24).value?.toString() || '',
        })
      })

      console.log(`📦 Rows to import: ${rows2.length}`)

      // =========================
      // TRANSACTION (BATCH MODE)
      // =========================

      await db.transaction(async (tx) => {
        for (const row of rows2) {
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
              else if (categoryNum >= 5000)
                workforceCategory = 'support_service'
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

              positionItem = assertExists(
                created,
                'Failed to create position item',
              )
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
                /*console.log(
              row.code,
              row.deptNameEn,
              row.itemNumber,
              row.status,
              row.employeeNumber,
              row.status === 'filled' ? parseDateOnly(row.dateOfBirth) : null,
            )*/
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

              const employmentExists = await tx.query.employments.findFirst({
                where: and(
                  eq(employments.employeeId, employee.id),
                  eq(employments.hireDate, row.hireDate),
                  eq(employments.startDate, row.startDate),
                ),
              })

              if (!employmentExists) {
                const data: EmploymentInsert = {
                  employeeId: employee.id,
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

                const emp = assertExists(
                  employment,
                  'Failed to create employment',
                )

                // =========================
                // 7. CONTRACT
                // =========================
                const hireDate = parseDateOnly(row.hireDate)

                const hireYear = hireDate
                  ? hireDate.substring(0, 4)
                  : new Date().getFullYear().toString()

                // const contractType =
                //   hireDate && new Date(hireDate) >= new Date('2025-05-01')
                //     ? 'initial'
                //     : 'renewal'

                const contractNumber = await generateSequenceNumber(
                  tx,
                  hireYear,
                )

                const [contract] = await tx
                  .insert(contracts)
                  .values({
                    employmentId: emp.id,
                    contractNumber,
                    startDate: parseDateOnly(row.startDate)!,
                    endDate: parseDateOnly(row.endDate)!,
                    contractType: 'initial',
                    status: 'active',
                  })
                  .returning()

                const createdContract = assertExists(
                  contract,
                  'Failed to create contract',
                )

                // =========================
                // 8. CONTRACT MOVEMENT
                // =========================

                const [movement] = await tx
                  .insert(contractMovements)
                  .values({
                    contractId: createdContract.id,
                    positionItemId: positionItem.id,
                    officialDepartmentId: department.id,
                    officialPositionId: position.id,
                    startDate: parseDateOnly(row.startDate)!,
                    endDate: parseDateOnly(row.endDate),
                    sequenceNumber: 1,
                    movementType: 'initial',
                    remarks: null,
                  })
                  .returning()

                const createdMovement = assertExists(
                  movement,
                  'Failed to create movement',
                )

                // =========================
                // 9. COMPENSATION
                // =========================

                await tx.insert(compensations).values({
                  contractMovementId: createdMovement.id,
                  effectiveDate: parseDateOnly(row.startDate)!,
                  baseSalary: '0',
                  status: 'approved',
                  reason: 'initial',
                })

                // =========================
                // 10. APPOINTMENT
                // =========================

                await tx.insert(appointments).values({
                  employmentId: emp.id,
                  actualDepartmentId: department.id,
                  actualPositionId: position.id,
                  startDate: parseDateOnly(row.startDate)!,
                  appointmentType: 'primary',
                  assignmentReason: 'service_need',
                })

                console.log(`✅ Imported: ${row.employeeNumber}`)
              }
            }
          } catch (err) {
            console.error(`❌ Failed row: ${row.employeeNumber}`, err)
          }
        }
      })
      break
    case 2:
      sheet = workbook.getWorksheet('Jawazat Database')
      if (!sheet) throw new Error('Sheet "Jawazat Database" not found')

      type ImportRow = {
        employeeNumber: string
        iqamaNumber: string
        dateExpiryHijri: string | null
        dateExpireGreg: string | null
        passportNumber: string | null
        passportExpiryDateGreg: string | null
      }

      const rows: ImportRow[] = []

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return

        const employeeNumber = getCell(row, 2) // B
        if (!employeeNumber) return

        rows.push({
          employeeNumber,
          iqamaNumber: getCell(row, 7)!, // G
          dateExpiryHijri: gregToHijri(getCellValue(row, 8)), // H ٠٥/١٠/١٤٤٨
          dateExpireGreg: normalizeDate(getCellValue(row, 9)), // I
          passportNumber: getCell(row, 17) || null, // Q
          passportExpiryDateGreg: normalizeDate(getCellValue(row, 18)), // R
        })
      })

      console.log(`📦 Rows to import: ${rows.length}`)

      await db.transaction(async (tx) => {
        for (const row of rows) {
          try {
            const employee = await tx.query.employees.findFirst({
              where: eq(employees.employeeNumber, row.employeeNumber),
            })

            if (!employee) {
              console.warn(`⚠️ Employee not found: ${row.employeeNumber}`)
              continue
            }

            //console.log(row)
            if (row.iqamaNumber) {
              const existingIqama =
                await tx.query.employeeIdentifications.findFirst({
                  where: and(
                    eq(employeeIdentifications.employeeId, employee.id),
                    eq(employeeIdentifications.type, 'iqama'),
                    eq(
                      employeeIdentifications.identificationNumber,
                      row.iqamaNumber,
                    ),
                  ),
                })
              if (!existingIqama) {
                await tx
                  .insert(employeeIdentifications)
                  .values({
                    employeeId: employee.id,
                    type: 'iqama',
                    identificationNumber: row.iqamaNumber,
                    issueDate: null,
                    expiryDate: row.dateExpireGreg,
                    expiryDateHijri: row.dateExpiryHijri,
                    isCurrent: true,
                  })
                  .onConflictDoNothing()
              }
            }

            if (row.passportNumber) {
              const existingPassport =
                await tx.query.employeeIdentifications.findFirst({
                  where: and(
                    eq(employeeIdentifications.employeeId, employee.id),
                    eq(employeeIdentifications.type, 'passport'),
                    eq(
                      employeeIdentifications.identificationNumber,
                      row.passportNumber,
                    ),
                  ),
                })
              if (!existingPassport) {
                await tx
                  .insert(employeeIdentifications)
                  .values({
                    employeeId: employee.id,
                    type: 'passport',
                    identificationNumber: row.passportNumber,
                    issueDate: null,
                    expiryDate: row.passportExpiryDateGreg,
                    expiryDateHijri: null,
                    isCurrent: true,
                  })
                  .onConflictDoNothing()
              }
            }
          } catch (error) {
            console.error(`❌ Failed row: ${row.employeeNumber}`, error)
          }
        }
      })
      break
    default:
      console.log('Test....')
  }

  console.log('🎉 Import completed')
}

function normalizeDate(value: any): string | null {
  if (!value) return null

  if (value instanceof Date) {
    return formatDateOnlyLocal(value)
  }

  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return formatDateOnlyLocal(date)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (trimmed.includes('/')) {
      const [dd, mm, yyyy] = trimmed.split('/')
      return `${yyyy}-${mm!.padStart(2, '0')}-${dd!.padStart(2, '0')}`
    }

    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      return formatDateOnlyLocal(date)
    }
  }

  console.warn('⚠️ Invalid date:', value)
  return null
}

function normalizeHijri(value: string | null) {
  if (!value) return null

  return value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .split('/')
    .reverse()
    .join('-')
}

function gregToHijri(value: any): string | null {
  const greg = normalizeDate(value)
  if (!greg) return null

  return moment(greg, 'YYYY-MM-DD').format('iYYYY-iMM-iDD')
}
