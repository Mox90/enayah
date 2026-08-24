// enayah-frontend/src/modules/hr/onboarding/constants/onboarding-steps.ts

export const ONBOARDING_STEP_KEYS = [
  'personal',
  'employmentContractAssignment',
  'compensation',
  'credentials',
  'review',
] as const

export type OnboardingStep = (typeof ONBOARDING_STEP_KEYS)[number]

export function isOnboardingStep(
  value: string | null,
): value is OnboardingStep {
  return (
    value !== null && ONBOARDING_STEP_KEYS.includes(value as OnboardingStep)
  )
}
