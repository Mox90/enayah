import ExcelJS from 'exceljs'
import { and, eq } from 'drizzle-orm'

import { db, employees, employeeIdentifications } from '../../db'

//import { getCell, getCellValue } from './helpers/excel.helpers'

//import { gregToHijri, normalizeDate } from './helpers/date.helpers'

import { ImportSummary } from './import.types'
import { getCell, getCellValue } from './excel.helpers'
import { gregToHijri, normalizeDate } from './date.helpers'

type JawazatRow = {
  employeeNumber: string
  iqamaNumber: string | null
  dateExpiryHijri: string | null
  dateExpireGreg: string | null
  passportNumber: string | null
  passportExpiryDateGreg: string | null
}

export async function importJawazatDatabase(
  workbook: ExcelJS.Workbook,
): Promise<ImportSummary> {
  const sheet = workbook.getWorksheet('Jawazat Database')

  if (!sheet) {
    throw new Error('Sheet "Jawazat Database" not found')
  }

  const rows: JawazatRow[] = []

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const employeeNumber = getCell(row, 2)
    if (!employeeNumber) return
    rows.push({
      employeeNumber,
      iqamaNumber: getCell(row, 7),
      dateExpiryHijri: gregToHijri(getCellValue(row, 8)),
      dateExpireGreg: normalizeDate(getCellValue(row, 9)),
      passportNumber: getCell(row, 17),
      passportExpiryDateGreg: normalizeDate(getCellValue(row, 18)),
    })
  })

  const summary: ImportSummary = {
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  await db.transaction(async (tx) => {
    for (const row of rows) {
      try {
        const employee = await tx.query.employees.findFirst({
          where: eq(employees.employeeNumber, row.employeeNumber),
        })

        if (!employee) {
          summary.skipped++
          summary.errors.push(`Employee not found: ${row.employeeNumber}`)
          continue
        }

        if (row.iqamaNumber) {
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

        if (row.passportNumber) {
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

        summary.imported++
      } catch (error) {
        summary.failed++

        summary.errors.push(`${row.employeeNumber}: ${String(error)}`)
      }
    }
  })

  return summary
}
