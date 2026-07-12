import ExcelJS from 'exceljs'

import { ImportType } from './import.types'
import { importEmployeeDatabase } from './import-employee-database'
import { importJawazatDatabase } from './import-jawazat-database'
//import { importEmployeeDatabase } from './import-employee-database'
//import { importJawazatDatabase } from './import-jawazat-database'

export async function runImport(type: ImportType, file: string) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file)

  switch (type) {
    case 'employee-database':
      return importEmployeeDatabase(workbook)

    case 'jawazat-database':
      return importJawazatDatabase(workbook)

    default:
      throw new Error(`Unsupported import type: ${type}`)
  }
}
