// enayah-backend/src/modules/hr/positions/constants/workforce-category.ts

export const WORKFORCE_CATEGORIES = [
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
] as const

export type WorkforceCategory = (typeof WORKFORCE_CATEGORIES)[number]

export const WORKFORCE_CATEGORY_CODE: Record<WorkforceCategory, number> = {
  physician: 1000,
  nurse: 2000,
  allied_health: 3000,
  administrative: 4000,
  support_service: 5000,
}

export function getWorkforceCategoryCode(category: WorkforceCategory): number {
  return WORKFORCE_CATEGORY_CODE[category]
}
