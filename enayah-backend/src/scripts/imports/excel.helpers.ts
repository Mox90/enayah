import ExcelJS from 'exceljs'

export function cleanString(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null

  const trimmed = String(value).trim()
  return trimmed.length ? trimmed : null
}

export function getCell(row: ExcelJS.Row, index: number): string | null {
  return cleanString(row.getCell(index).text)
}

export function getCellValue(
  row: ExcelJS.Row,
  index: number,
): ExcelJS.CellValue {
  return row.getCell(index).value
}

export function assertExists<T>(
  value: T | undefined | null,
  message: string,
): T {
  if (!value) throw new Error(message)
  return value
}
