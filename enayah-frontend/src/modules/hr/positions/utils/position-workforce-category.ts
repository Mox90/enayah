// enayah-frontend/src/modules/hr/positions/utils/position-workforce-category.ts

export const POSITION_WORKFORCE_CATEGORY_CODES = {
  physician: 1000,
  nurse: 2000,
  allied_health: 3000,
  administrative: 4000,
  support_service: 5000,
} as const

export type PositionWorkforceCategory =
  keyof typeof POSITION_WORKFORCE_CATEGORY_CODES

export function getPositionCategoryCode(
  category: PositionWorkforceCategory,
): number {
  return POSITION_WORKFORCE_CATEGORY_CODES[category]
}
