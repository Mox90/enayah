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

// export function toPersianDigits(
//   value: string | number | null | undefined,
// ): string {
//   if (value == null) return ''

//   const stringValue = String(value)
//   const hasPlus = stringValue.startsWith('+')

//   // Clean the string to process only digits
//   const cleanValue = hasPlus ? stringValue.slice(1) : stringValue
//   const converted = cleanValue.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])

//   // \u200E forces the '+' to stay on the left in RTL layouts
//   return hasPlus ? `\u200E+${converted}` : converted
// }

export function toArabicDigits(
  value: string | number | null | undefined,
): string {
  if (value == null) return ''
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

export const getExpiryStatus = (
  expiryDateStr: string | null | undefined,
  isRtl: boolean,
) => {
  const fallback = {
    bgClass: 'bg-gradient-to-b from-card to-muted/10',
    borderClass: 'border-l-primary/70',
    pulseClass: '',
    diffDays: null as number | null, // Added this line
  }

  if (!expiryDateStr) return fallback

  const now = new Date()
  const expiry = new Date(expiryDateStr)

  if (Number.isNaN(expiry.getTime())) return fallback

  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      bgClass: 'bg-red-500/5 dark:bg-red-500/10',
      borderClass: isRtl
        ? 'border-r-red-600 border-red-500/30'
        : 'border-l-red-600 border-red-500/30',
      pulseClass:
        'animate-[pulse_1.5s_infinite] shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      diffDays,
    }
  }
  if (diffDays <= 30) {
    return {
      bgClass: 'bg-red-500/5 dark:bg-red-500/10',
      borderClass: isRtl
        ? 'border-r-red-500 border-red-500/20'
        : 'border-l-red-500 border-red-500/20',
      pulseClass: 'animate-pulse',
      diffDays,
    }
  }
  if (diffDays <= 60) {
    return {
      bgClass: 'bg-amber-500/5 dark:bg-amber-500/10',
      borderClass: isRtl
        ? 'border-r-amber-500 border-amber-500/20'
        : 'border-l-amber-500 border-amber-500/20',
      pulseClass: 'animate-pulse',
      diffDays,
    }
  }
  if (diffDays <= 90) {
    return {
      bgClass: 'bg-yellow-500/5 dark:bg-yellow-500/10',
      borderClass: isRtl
        ? 'border-r-yellow-500 border-yellow-500/20'
        : 'border-l-yellow-500 border-yellow-500/20',
      pulseClass: 'animate-pulse',
      diffDays,
    }
  }
  return {
    bgClass: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    borderClass: isRtl
      ? 'border-r-emerald-500 border-emerald-500/20'
      : 'border-l-emerald-500 border-emerald-500/20',
    pulseClass: '',
    diffDays,
  }
}
