// enayah-frontend/src/modules/hr/onboarding/utils/has-identification-data.ts

import { IdentificationInput } from '../types/onboarding.types'

export function hasIdentificationData(
  identification?: IdentificationInput | null,
) {
  if (!identification) {
    return false
  }

  return Boolean(
    identification.identificationNumber?.trim() ||
    identification.issueDate ||
    identification.expiryDate ||
    identification.sponsor?.trim() ||
    identification.issuingAuthority?.trim() ||
    identification.occupation?.trim() ||
    identification.fileId,
  )
}
