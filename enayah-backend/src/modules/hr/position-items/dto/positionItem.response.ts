export interface PositionItemResponse {
  id: string
  itemNumber: string
  departmentId: string
  positionId: string
  jobGrade?: {
    id: string
    name: string
  } | null
  categoryCode?: number
  minSalary?: number
  maxSalary?: number
  //status: string
}
