// enayah-frontend/src/modules/hr/onboarding/utils/clear-field-error.ts

import { Dispatch, SetStateAction } from 'react'

export function clearFieldError<T extends Record<string, string | undefined>>(
  setErrors: Dispatch<SetStateAction<T>>,
  field: keyof T,
) {
  setErrors((previous) => {
    if (!previous[field]) {
      return previous
    }

    const next = { ...previous }

    delete next[field]

    return next
  })
}
