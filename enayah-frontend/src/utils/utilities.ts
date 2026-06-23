import { format } from 'date-fns'

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'vacant':
      return 'bg-green-100 text-green-800 border-green-300'

    case 'filled':
      return 'bg-red-100 text-red-800 border-red-300'

    case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-300'

    case 'frozen':
      return 'bg-rose-200 text-rose-900 border-rose-400'

    default:
      return ''
  }
}

export interface EmployeeName {
  firstNameEn: string | null
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn: string | null

  firstNameAr: string | null
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr: string | null
}

export function getEmployeeFullName(
  employee?: EmployeeName | null,
  locale: 'en' | 'ar' = 'en',
) {
  if (!employee) return ''

  if (locale === 'ar') {
    return [
      employee.firstNameAr,
      employee.secondNameAr,
      employee.thirdNameAr,
      employee.familyNameAr,
    ]
      .filter(Boolean)
      .join(' ')
  }

  return [
    employee.firstNameEn,
    employee.secondNameEn,
    employee.thirdNameEn,
    employee.familyNameEn,
  ]
    .filter(Boolean)
    .join(' ')
}

export function humanize(value?: string | null) {
  if (!value) return '-'

  return value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDate(value?: string | null) {
  return value ? format(new Date(value), 'dd-MMM-yyyy') : '-'
}

export function toArabic(date: string | null | undefined, indicator: number) {
  if (!date) return ''
  const parsedDate = new Date(date)
  const isInvalidDate = Number.isNaN(parsedDate.getTime())
  let arabicDate = ''
  switch (indicator) {
    case 1:
      if (isInvalidDate) return ''
      arabicDate = new Intl.DateTimeFormat('ar-SA-u-nu-arab', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parsedDate)
      break
    case 2:
      arabicDate = date.replace(/\d/g, (d) => Number(d).toLocaleString('ar-SA'))
      break
    case 3:
      if (isInvalidDate) return ''
      arabicDate = new Intl.DateTimeFormat('ar-SA-u-nu-arab', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(parsedDate)
      break
    default:
      arabicDate = date
  }

  return arabicDate
}

export function toPersianDigits(
  value: string | number | null | undefined,
): string {
  if (value == null) return ''
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

export function toArabicDigits(
  value: string | number | null | undefined,
): string {
  if (value == null) return ''
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}
