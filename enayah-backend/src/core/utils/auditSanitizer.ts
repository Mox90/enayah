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
  const lowerKey = key.toLowerCase()
  if (options?.allowList) {
    return !options.allowList.includes(key)
  }

  /*if (options?.redactFields?.includes(key)) {
    return true
  }*/
  if (
    options?.redactFields?.some((field) =>
      lowerKey.includes(field.toLowerCase()),
    )
  ) {
    return true
  }

  return DEFAULT_DENY_LIST.some((k) => lowerKey.includes(k.toLowerCase()))
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

    /*if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value, options)
    } else {
      result[key] = value
    }*/
    /*if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === 'object' && !(item instanceof Date)
          ? sanitizeObject(item, options)
          : item,
      )
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value, options)
    } else {
      result[key] = value
    }*/
    if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (Array.isArray(value)) {
      const { allowList, ...rest } = options ?? {}
      const childOptions = rest

      result[key] = value.map((item) =>
        item && typeof item === 'object' && !(item instanceof Date)
          ? sanitizeObject(item, childOptions)
          : item,
      )
    } else if (value && typeof value === 'object') {
      const { allowList, ...rest } = options ?? {}
      const childOptions = rest

      result[key] = sanitizeObject(value, childOptions)
    } else {
      result[key] = value
    }
  }

  return result
}
