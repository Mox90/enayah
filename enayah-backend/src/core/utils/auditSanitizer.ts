type SanitizeOptions = {
  allowList?: string[]
  redactFields?: string[]
}

const DEFAULT_DENY_LIST = [
  'password',
  'passwordHash',
  'nationalId',
  'email',
  'phone',
  'mobile',
  'bankAccount',
  'iban',
  'salary',
]

function shouldRedact(key: string, options?: SanitizeOptions) {
  if (options?.allowList) {
    return !options.allowList.includes(key)
  }

  if (options?.redactFields?.includes(key)) {
    return true
  }

  return DEFAULT_DENY_LIST.some((k) =>
    key.toLowerCase().includes(k.toLowerCase()),
  )
}

export function sanitizeObject(
  obj: any,
  options?: SanitizeOptions,
): Record<string, any> | undefined {
  if (!obj || typeof obj !== 'object') return undefined

  const result: Record<string, any> = {}

  for (const key of Object.keys(obj)) {
    const value = obj[key]

    if (shouldRedact(key, options)) {
      result[key] = '[REDACTED]'
      continue
    }

    if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value, options)
    } else {
      result[key] = value
    }
  }

  return result
}
