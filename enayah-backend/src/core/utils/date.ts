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
