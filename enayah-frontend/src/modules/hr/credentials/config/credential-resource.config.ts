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

export type CredentialResourceSegment =
  (typeof CREDENTIAL_RESOURCE_SEGMENTS)[CredentialKind]
