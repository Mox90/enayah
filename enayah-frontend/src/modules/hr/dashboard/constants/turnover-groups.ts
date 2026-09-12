// enayah-frontend/src/modules/hr/dashboard/constants/turnover-groups.ts

import type { WorkforceCategory } from '../types/hr-dashboard.types'

export type TurnoverGroupKey =
  | 'clinics'
  | 'alliedHealth'
  | 'infectionControl'
  | 'emergencyRoom'
  | 'intensiveCareUnit'
  | 'pediatricIntensiveCareUnit'
  | 'operatingRoom'
  | 'laborDelivery'
  | 'neonatalIntensiveCareUnit'
  | 'maleWard'
  | 'femaleWard'
  | 'pediatricWard'
  | 'obstetricsGynecology'
  | 'nursingOffice'
  | 'administration'
  | 'supportService'
  | 'other'

export type TurnoverGroupDefinition = {
  key: TurnoverGroupKey
  departments?: string[]
  workforceCategories: WorkforceCategory[]
}

export const TURNOVER_GROUPS: TurnoverGroupDefinition[] = [
  // existing definitions
]

export const TURNOVER_WORKFORCE_ORDER: WorkforceCategory[] = [
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
]

export const normalizeDepartmentName = (value: string) => {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
