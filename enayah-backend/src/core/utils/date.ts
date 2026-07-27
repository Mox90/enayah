import { IqamaRenewalProcessError } from '../../modules/hr/iqama-renewal/types/iqama-renewal-process.types'

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMinutes = (date: Date, minutes: number) => {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

export const addHours = (date: Date, hours: number) => {
  const result = new Date(date)

  result.setHours(result.getHours() + hours)

  return result
}

export const getRiyadhTodayDateOnly = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new IqamaRenewalProcessError(
      'Unable to determine the current business date.',
      500,
      'BUSINESS_DATE_RESOLUTION_FAILED',
    )
  }

  return `${year}-${month}-${day}`
}
