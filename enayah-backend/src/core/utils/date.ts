// enayaha-backend/src/core/utils/date.ts

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
    // throw new IqamaRenewalProcessError(
    //   'Unable to determine the current business date.',
    //   500,
    //   'BUSINESS_DATE_RESOLUTION_FAILED',
    // )
    throw new Error('Unable to determine the current business date.')
  }

  return `${year}-${month}-${day}`
}

export const startOfRiyadhDay = (value: string): Date => {
  return new Date(`${value}T00:00:00.000+03:00`)
}

export const startOfNextRiyadhDay = (value: string): Date => {
  const start = startOfRiyadhDay(value)

  return new Date(start.getTime() + 24 * 60 * 60 * 1000)
}
