// enayah-frontend/src/modules/hr/employees/types/employee-filter.types.ts

export type EmployeeStaffCategory = 'civilian' | 'military' | 'contractual'

export interface EmployeeFilters {
  departmentIds: string[]
  positionIds: string[]
  categoryCodes: number[]
  genders: string[]
  nationalities: string[]
  staffCategory: EmployeeStaffCategory[]

  employmentStatuses: string[]

  hireDateFrom?: string | null
  hireDateTo?: string | null

  contractEndDateFrom?: string | null
  contractEndDateTo?: string | null
}
