import moment from 'moment-hijri'

export function formatDateOnlyLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

export function normalizeDate(value: unknown): string | null {
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

      if (!dd || !mm || !yyyy) return null

      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    }

    const date = new Date(trimmed)

    if (!isNaN(date.getTime())) {
      return formatDateOnlyLocal(date)
    }
  }

  console.warn('⚠️ Invalid date:', value)
  return null
}

export function normalizeHijri(value: string | null): string | null {
  if (!value) return null

  return value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .split('/')
    .reverse()
    .join('-')
}

export function gregToHijri(value: unknown): string | null {
  const greg = normalizeDate(value)

  if (!greg) return null

  return moment(greg, 'YYYY-MM-DD').format('iYYYY-iMM-iDD')
}
