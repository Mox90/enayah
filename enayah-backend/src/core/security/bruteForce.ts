const attempts = new Map<string, { count: number; lastAttempt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW = 15 * 60 * 1000 // 15 mins

export const checkBruteForce = (key: string) => {
  const record = attempts.get(key)

  if (!record) return false

  if (Date.now() - record.lastAttempt > WINDOW) {
    attempts.delete(key)
    return false
  }

  return record.count >= MAX_ATTEMPTS
}

export const recordFailedAttempt = (key: string) => {
  const record = attempts.get(key) || { count: 0, lastAttempt: Date.now() }

  record.count++
  record.lastAttempt = Date.now()

  attempts.set(key, record)
}

export const clearFailedAttempts = (key: string) => {
  attempts.delete(key)
}
