// enayah-backend/src/modules/hr/offboarding/utils/offboarding-date.util.ts

import { AppError } from '../../../../core/errors/AppError'

export function getTodayInRiyadh(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value

  const month = parts.find((part) => part.type === 'month')?.value

  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new AppError('Failed to resolve current Riyadh date', 500)
  }

  return `${year}-${month}-${day}`
}
