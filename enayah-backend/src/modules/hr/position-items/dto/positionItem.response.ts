export interface PositionItemReponseDTO {
  id: string
  name: string
  departmentId: string
  positionId: string
  jobGrade?: {
    id: string
    name: string
  } | null
  categoryCode?: number
  minSalary?: number
  maxSalary?: number
  status: string
}
