// enayah-frontend/src/modules/hr/onboarding/hooks/use-form-errors.ts

'use client'

import { useCallback, useState } from 'react'

export function useFormErrors<T extends object>() {
  const [errors, setErrors] = useState<T>({} as T)

  const clearError = useCallback((field: keyof T) => {
    setErrors((previous) => {
      if (!(field in previous)) {
        return previous
      }

      const next = { ...previous }

      Reflect.deleteProperty(next, field)

      return next
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({} as T)
  }, [])

  const updateErrors = useCallback((updater: (previous: T) => T) => {
    setErrors(updater)
  }, [])

  return {
    errors,
    setErrors,
    updateErrors,
    clearError,
    clearErrors,
  }
}
