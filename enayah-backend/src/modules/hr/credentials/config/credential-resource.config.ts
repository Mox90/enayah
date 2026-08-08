// enayah-backend/src/modules/hr/crednetials/config

export const CREDENTIAL_RESOURCE_SEGMENTS = {
  degree: 'degrees',
  board: 'boards',
  fellowship: 'fellowships',
  membership: 'memberships',
  license: 'licenses',
  'life-support': 'life-support',
  malpractice: 'malpractice',
} as const

export type CredentialKind = keyof typeof CREDENTIAL_RESOURCE_SEGMENTS
