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

export function toArabic(date: string) {
  const arabicDate = new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))

  return arabicDate
}
