export interface EmployeeFilters {
  departmentIds: string[]
  positionIds: string[]
  categoryCodes: number[]
  genders: string[]
  nationalities: string[]
  employmentStatuses: string[]

  hireDateFrom?: string | null
  hireDateTo?: string | null

  contractEndDateFrom?: string | null
  contractEndDateTo?: string | null
}
