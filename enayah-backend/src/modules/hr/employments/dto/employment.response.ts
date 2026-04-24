export interface EmploymentResponse {
  id: string
  employeeId: string
  staffCategory: 'civilian' | 'military' | 'contractual'
  positionItemId?: string
  status:
    | 'active'
    | 'terminated'
    | 'resigned'
    | 'eoc'
    | 'transferred'
    | 'on_leave'
  startDate: string
  endDate?: string
}
